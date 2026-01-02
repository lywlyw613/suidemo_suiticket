module nft_ticketing::ticket_nft;

use sui::object::{Self, UID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};
use std::string::{Self, String};
use std::option::{Self, Option};

/// NFT 票券結構
struct TicketNFT has key, store {
    id: UID,
    /// 活動 ID
    event_id: String,
    /// 票種名稱
    ticket_type: String,
    /// 票券編號（唯一）
    ticket_number: String,
    /// 座位區域（可選）
    seat_zone: Option<String>,
    /// 座位號碼（可選）
    seat_number: Option<String>,
    /// 購買時間（Unix timestamp）
    purchase_time: u64,
    /// 購買價格
    purchase_price: u64,
    /// 主辦方 ID
    organizer_id: String,
    /// 是否已使用
    is_used: bool,
    /// 活動名稱
    event_name: String,
    /// 活動開始時間
    event_start_time: u64,
    /// 場地名稱
    venue_name: String,
}

/// 票券管理員（用於鑄造）
struct TicketAdmin has key {
    id: UID,
}

/// Gate capability: holder can redeem tickets for this event
/// 驗票權限：持有者可以驗證該活動的票券
public struct GateCap has key {
    id: UID,
    event_id: String,
}

/// 初始化函數
fun init(ctx: &mut TxContext) {
    let admin = TicketAdmin {
        id: object::new(ctx),
    };
    transfer::share_object(admin);
}

/// 鑄造 NFT 票券
public entry fun mint_ticket(
    admin: &TicketAdmin,
    event_id: String,
    ticket_type: String,
    ticket_number: String,
    seat_zone: Option<String>,
    seat_number: Option<String>,
    purchase_price: u64,
    organizer_id: String,
    event_name: String,
    event_start_time: u64,
    venue_name: String,
    recipient: address,
    ctx: &mut TxContext,
) {
    let ticket = TicketNFT {
        id: object::new(ctx),
        event_id,
        ticket_type,
        ticket_number,
        seat_zone,
        seat_number,
        purchase_time: tx_context::epoch_timestamp_ms(ctx),
        purchase_price,
        organizer_id,
        is_used: false,
        event_name,
        event_start_time,
        venue_name,
    };
    
    transfer::public_transfer(ticket, recipient);
}

/// 標記票券為已使用（只能由主辦方或驗票系統調用）
public entry fun mark_as_used(ticket: &mut TicketNFT) {
    ticket.is_used = true;
}

/// 創建 GateCap（驗票權限）
/// 主辦方創建活動時可以創建 GateCap，然後轉移給驗票人員
public entry fun create_gate_cap(
    admin: &TicketAdmin,
    event_id: String,
    recipient: address,
    ctx: &mut TxContext,
) {
    let cap = GateCap {
        id: object::new(ctx),
        event_id,
    };
    transfer::transfer(cap, recipient);
}

/// 驗票（Redeem/Check-in）：需要 GateCap 權限
/// 驗證票券是否屬於該活動，並標記為已使用
public entry fun redeem(
    ticket: &mut TicketNFT,
    cap: &GateCap,
    ctx: &mut TxContext,
) {
    // 檢查票券是否已使用
    assert!(!ticket.is_used, 0); // E_ALREADY_USED
    
    // 檢查票券是否屬於該活動
    assert!(ticket.event_id == cap.event_id, 1); // E_WRONG_EVENT
    
    // 標記為已使用
    ticket.is_used = true;
}

/// 轉移 GateCap 給其他驗票人員
public entry fun grant_cap(cap: GateCap, recipient: address) {
    transfer::transfer(cap, recipient);
}

/// 獲取票券資訊
public fun get_ticket_info(ticket: &TicketNFT): (
    String,
    String,
    String,
    u64,
    bool,
) {
    (
        ticket.event_id,
        ticket.ticket_type,
        ticket.ticket_number,
        ticket.purchase_price,
        ticket.is_used,
    )
}

