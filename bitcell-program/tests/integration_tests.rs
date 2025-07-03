use solana_program_test::*;
use solana_sdk::{
    account::Account,
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    signature::{Keypair, Signer},
    transaction::Transaction,
};
use bitcell_program::{
    BitcellAccount, BitcellInstruction, 
    process_instruction,
};

#[tokio::test]
async fn test_initialize_cell() {
    let program_id = Pubkey::new_unique();
    let mut program_test = ProgramTest::new(
        "bitcell_program",
        program_id,
        processor!(process_instruction),
    );

    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;

    // Create cell account
    let cell_keypair = Keypair::new();
    let cell_account = Account::new(
        0,
        BitcellAccount::SIZE,
        &program_id,
    );

    banks_client
        .process_transaction(Transaction::new_signed_with_payer(
            &[system_instruction::create_account(
                &payer.pubkey(),
                &cell_keypair.pubkey(),
                0,
                BitcellAccount::SIZE as u64,
                &program_id,
            )],
            Some(&payer.pubkey()),
            &[&payer, &cell_keypair],
            recent_blockhash,
        ))
        .await
        .unwrap();

    // Test initialize cell instruction
    let instruction_data = BitcellInstruction::InitializeCell {
        initial_deposit: 1000,
        maturity_period: 30,
        risk_tolerance: 50,
        max_drawdown: 15,
        trading_frequency: 60,
    };

    let instruction = Instruction::new_with_borsh(
        program_id,
        &instruction_data,
        vec![
            AccountMeta::new(payer.pubkey(), true),
            AccountMeta::new(cell_keypair.pubkey(), false),
            AccountMeta::new_readonly(solana_program::system_program::id(), false),
        ],
    );

    let transaction = Transaction::new_signed_with_payer(
        &[instruction],
        Some(&payer.pubkey()),
        &[&payer],
        recent_blockhash,
    );

    banks_client.process_transaction(transaction).await.unwrap();

    // Verify the cell was initialized correctly
    let cell_account = banks_client
        .get_account(cell_keypair.pubkey())
        .await
        .expect("get_account")
        .expect("cell account not found");

    let cell_data: BitcellAccount = borsh::from_slice(&cell_account.data)
        .expect("Failed to deserialize cell data");

    assert_eq!(cell_data.owner, payer.pubkey());
    assert_eq!(cell_data.locked_funds, 1000.0);
    assert_eq!(cell_data.available_profits, 0.0);
    assert_eq!(cell_data.health, 100);
    assert!(cell_data.is_initialized);
    assert_eq!(cell_data.risk_tolerance, 50);
    assert_eq!(cell_data.max_drawdown, 15);
    assert_eq!(cell_data.trading_frequency, 60);
}

#[tokio::test]
async fn test_deposit_funds() {
    // Similar test structure for deposit funds...
    // TODO: Implement full test
}

#[tokio::test]
async fn test_withdraw_profits() {
    // Similar test structure for withdraw profits...
    // TODO: Implement full test
}

#[tokio::test]
async fn test_update_settings() {
    // Similar test structure for update settings...
    // TODO: Implement full test
}
