import { Router, Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { memoryStorage } from '../storage/memoryStorage';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * 登入（zkLogin）
 * POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('📥 收到登入請求:', { provider: req.body.provider, tokenLength: req.body.token?.length });
    const { provider, token } = req.body;

    if (!provider || !token) {
      console.log('❌ 缺少必要參數:', { provider: !!provider, token: !!token });
      return res.status(400).json({
        success: false,
        error: 'provider and token are required',
      });
    }

    let decoded: any;
    let email: string = '';
    let name: string = '';
    let avatar: string = '';
    let suiAddress: string = '';

    // Wallet 登入：token 就是錢包地址
    if (provider === 'wallet') {
      // 驗證地址格式
      if (!token.startsWith('0x') || token.length < 20) {
        return res.status(400).json({
          success: false,
          error: 'Invalid wallet address format',
        });
      }
      
      suiAddress = token;
      email = `${suiAddress.slice(0, 8)}@wallet.local`;
      name = `Wallet User ${suiAddress.slice(0, 6)}...${suiAddress.slice(-4)}`;
      avatar = '';
      
      console.log('💼 Wallet 登入:', { suiAddress, name });
    }
    // 開發模式：直接使用 mock 數據，跳過 zkLogin 驗證
    else if (provider === 'dev') {
      try {
        console.log('🔧 開發模式：開始處理 token');
        // 解析 base64 編碼的 mock token（先用 atob 解碼，再用 decodeURIComponent 處理 Unicode）
        const decodedBase64 = Buffer.from(token, 'base64').toString();
        console.log('🔧 Base64 解碼成功，長度:', decodedBase64.length);
        const decodedURI = decodeURIComponent(decodedBase64);
        console.log('🔧 URI 解碼成功');
        const mockData = JSON.parse(decodedURI);
        console.log('🔧 JSON 解析成功:', mockData);
        decoded = mockData;
        email = decoded.email || 'dev@example.com';
        name = decoded.name || '開發測試用戶';
        avatar = decoded.picture || '';
        // 開發模式使用固定的 Sui 地址格式
        suiAddress = `0x${Buffer.from(decoded.sub).toString('hex').slice(0, 64).padEnd(64, '0')}`;
        
        console.log('🔧 開發模式登入:', { email, name, suiAddress });
      } catch (error: any) {
        console.error('Dev mode decode error:', error);
        console.error('Error stack:', error.stack);
        return res.status(401).json({
          success: false,
          error: `Invalid dev token format: ${error.message}`,
        });
      }
    } else {
      // 正常模式：驗證 Enoki zkLogin JWT token
      // TODO: 驗證 Enoki zkLogin JWT token
      // 這裡需要調用 Enoki API 驗證 token 並獲取 Sui 地址
      // 暫時先解析 JWT 獲取基本信息

      try {
        // 注意：Enoki 的 JWT 需要通過 Enoki API 驗證，這裡只是示例
        // jwt.decode 不會拋出錯誤，只會返回 null 如果 token 無效
        decoded = jwt.decode(token);
        
        if (!decoded) {
          return res.status(401).json({
            success: false,
            error: 'Invalid token: unable to decode',
          });
        }
      } catch (error: any) {
        console.error('JWT decode error:', error);
        return res.status(401).json({
          success: false,
          error: 'Invalid token: decode failed',
        });
      }

      if (!decoded.sub) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token format: missing subject',
        });
      }

      // 從 JWT 獲取用戶信息
      email = decoded.email || decoded.sub;
      name = decoded.name || email.split('@')[0];
      avatar = decoded.picture || '';

      // 計算 Sui 地址（從 zkLogin）
      // 實際應該從 Enoki API 獲取
      suiAddress = `0x${Buffer.from(decoded.sub).toString('hex').slice(0, 64)}`;
    }

    // 驗證必要變量已設置
    if (!suiAddress) {
      console.error('❌ suiAddress 未設置，provider:', provider);
      return res.status(500).json({
        success: false,
        error: 'Internal error: suiAddress not set',
      });
    }

    // 檢查 MongoDB 連接
    const mongoose = await import('mongoose');
    const useMemoryStorage = mongoose.default.connection.readyState !== 1;
    
    if (useMemoryStorage) {
      console.warn('⚠️  MongoDB 未連接，使用內存存儲（僅用於開發）');
    }

    // 查找或創建用戶
    let user: any;
    try {
      if (useMemoryStorage) {
        // 使用內存存儲
        console.log('🔍 [Memory] 查找用戶，suiAddress:', suiAddress);
        let memoryUser = memoryStorage.findUserBySuiAddress(suiAddress);
        
        if (!memoryUser) {
          // 創建新用戶
          console.log('💾 [Memory] 創建新用戶:', { suiAddress, email, name, avatar, loginMethod: provider });
          memoryUser = memoryStorage.createUser({
            suiAddress,
            email,
            name,
            avatar,
            loginMethod: provider,
          });
        } else {
          // 更新用戶
          console.log('💾 [Memory] 更新現有用戶:', memoryUser.id);
          memoryUser = memoryStorage.updateUser(suiAddress, {
            loginMethod: provider,
            email,
            name,
            avatar,
          }) || memoryUser;
        }
        
        // 轉換為類似 Mongoose 文檔的格式
        user = {
          _id: { toString: () => memoryUser.id },
          id: memoryUser.id,
          suiAddress: memoryUser.suiAddress,
          email: memoryUser.email,
          name: memoryUser.name,
          avatar: memoryUser.avatar,
          loginMethod: memoryUser.loginMethod,
        };
      } else {
        // 使用 MongoDB
        console.log('🔍 查找用戶，suiAddress:', suiAddress);
        user = await User.findOne({ suiAddress });
        
        if (!user) {
          // 創建新用戶
          console.log('創建新用戶:', { suiAddress, email, name, avatar, loginMethod: provider });
          try {
            user = await User.create({
              suiAddress,
              email,
              name,
              avatar,
              loginMethod: provider,
            });
            console.log('用戶創建成功:', user._id.toString());
          } catch (createError: any) {
            console.error('創建用戶失敗:', createError);
            // 如果是重複鍵錯誤，可能是並發創建，重新查找
            if (createError.code === 11000 || createError.message?.includes('duplicate')) {
              console.log('檢測到重複鍵，重新查找用戶');
              user = await User.findOne({ suiAddress });
              if (!user) {
                throw createError;
              }
            } else {
              throw createError;
            }
          }
        } else {
          // 更新最後登入時間
          console.log('更新現有用戶:', user._id.toString());
          user.loginMethod = provider;
          if (email) user.email = email;
          if (name) user.name = name;
          if (avatar !== undefined) user.avatar = avatar;
          await user.save();
        }
      }
    } catch (dbError: any) {
      console.error('數據庫操作錯誤:', dbError);
      console.error('錯誤堆棧:', dbError.stack);
      return res.status(500).json({
        success: false,
        error: `Database error: ${dbError.message}`,
        details: process.env.NODE_ENV === 'development' ? dbError.stack : undefined,
      });
    }

    // 生成 JWT token
    // 使用 _id 轉換為字符串，因為 Mongoose 的虛擬 id 可能還沒準備好
    const userId = user._id.toString();
    const sessionToken = jwt.sign(
      {
        userId: userId,
        suiAddress: user.suiAddress,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info('User logged in', {
      userId: userId,
      suiAddress: user.suiAddress,
      provider,
    });

    res.json({
      success: true,
      token: sessionToken,
      user: {
        id: userId,
        suiAddress: user.suiAddress,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    console.error('❌ Login route error:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // 確保錯誤被正確處理
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || 'Internal server error',
        errorName: error.name,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    } else {
      next(error);
    }
  }
});

/**
 * 登出
 * POST /api/auth/logout
 */
router.post('/logout', (req: Request, res: Response) => {
  // 前端清除 token 即可
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * 獲取當前用戶
 * GET /api/users/me
 */
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      const isMongoConnected = mongoose.connection.readyState === 1;
      let user;

      if (isMongoConnected) {
        user = await User.findById(decoded.userId);
      } else {
        // 使用內存存儲
        user = memoryStorage.findUserBySuiAddress(decoded.suiAddress);
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id || (user as any)._id?.toString() || '',
          suiAddress: user.suiAddress,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }
  } catch (error) {
    next(error);
  }
});

export default router;

