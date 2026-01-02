// 臨時內存存儲（僅用於開發，當 MongoDB 未連接時）
// 注意：服務器重啟後數據會丟失

interface MemoryUser {
  id: string;
  suiAddress: string;
  email?: string;
  name?: string;
  avatar?: string;
  loginMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

class MemoryStorage {
  private users: Map<string, MemoryUser> = new Map();
  private idCounter = 1;

  createUser(data: {
    suiAddress: string;
    email?: string;
    name?: string;
    avatar?: string;
    loginMethod?: string;
  }): MemoryUser {
    const id = `mem_${this.idCounter++}`;
    const now = new Date();
    const user: MemoryUser = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(data.suiAddress, user);
    console.log('💾 [Memory] 創建用戶:', user);
    return user;
  }

  findUserBySuiAddress(suiAddress: string): MemoryUser | null {
    const user = this.users.get(suiAddress);
    if (user) {
      console.log('💾 [Memory] 找到用戶:', user);
    }
    return user || null;
  }

  updateUser(suiAddress: string, updates: Partial<MemoryUser>): MemoryUser | null {
    const user = this.users.get(suiAddress);
    if (!user) return null;

    Object.assign(user, updates, { updatedAt: new Date() });
    this.users.set(suiAddress, user);
    console.log('💾 [Memory] 更新用戶:', user);
    return user;
  }

  getUserCount(): number {
    return this.users.size;
  }
}

export const memoryStorage = new MemoryStorage();

