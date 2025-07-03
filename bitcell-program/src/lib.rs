use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
    program::invoke,
    system_instruction,
};
use borsh::{BorshDeserialize, BorshSerialize};

// Custom error types for better error handling
#[derive(Debug)]
pub enum BitcellError {
    InvalidInstructionData,
    AccountNotInitialized,
    InsufficientFunds,
    Unauthorized,
    MaturityNotReached,
    InvalidAmount,
}

impl From<BitcellError> for ProgramError {
    fn from(e: BitcellError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

// Define the data structure for our Bitcell account
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct BitcellAccount {
    pub owner: Pubkey,
    pub locked_funds: f32,
    pub available_profits: f32,
    pub maturity_timestamp: u64,
    pub health: u8,
    pub active_positions: u8,
    pub total_trades: u16,
    pub success_rate: u8,
    pub is_initialized: bool,
    pub risk_tolerance: u8,
    pub max_drawdown: u8,
    pub trading_frequency: u16,
}

impl BitcellAccount {
    pub const SIZE: usize = 32 + 4 + 4 + 8 + 1 + 1 + 2 + 1 + 1 + 1 + 1 + 2; // 58 bytes
}

// Define the instruction types
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum BitcellInstruction {
    /// Initialize a new cell
    /// Accounts:
    /// 0. [signer, writable] Payer account
    /// 1. [writable] Cell account to initialize
    /// 2. [] System program
    InitializeCell {
        initial_deposit: u32,
        maturity_period: u32,
        risk_tolerance: u8,
        max_drawdown: u8,
        trading_frequency: u16,
    },
    /// Deposit funds into an existing cell
    /// Accounts:
    /// 0. [signer, writable] Payer account
    /// 1. [writable] Cell account
    DepositFunds {
        amount: u32,
    },
    /// Withdraw available profits
    /// Accounts:
    /// 0. [signer, writable] Owner account
    /// 1. [writable] Cell account
    WithdrawProfits {
        amount: u32,
    },
    /// Check maturity status
    /// Accounts:
    /// 0. [signer] Owner account
    /// 1. [] Cell account
    CheckMaturity,
    /// Update cell settings
    /// Accounts:
    /// 0. [signer] Owner account
    /// 1. [writable] Cell account
    UpdateSettings {
        risk_tolerance: u8,
        max_drawdown: u8,
        trading_frequency: u16,
    },
}

// Declare the program's entrypoint
entrypoint!(process_instruction);

// Program entrypoint implementation
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Parse the instruction data
    let instruction = if instruction_data.len() >= 1 {
        match instruction_data[0] {
            0 => {
                if instruction_data.len() < 13 {
                    return Err(ProgramError::InvalidInstructionData);
                }
                let initial_deposit = u32::from_le_bytes([
                    instruction_data[1],
                    instruction_data[2],
                    instruction_data[3],
                    instruction_data[4],
                ]);
                let maturity_period = u32::from_le_bytes([
                    instruction_data[5],
                    instruction_data[6],
                    instruction_data[7],
                    instruction_data[8],
                ]);
                let risk_tolerance = instruction_data[9];
                let max_drawdown = instruction_data[10];
                let trading_frequency = u16::from_le_bytes([
                    instruction_data[11],
                    instruction_data[12],
                ]);
                BitcellInstruction::InitializeCell {
                    initial_deposit,
                    maturity_period,
                    risk_tolerance,
                    max_drawdown,
                    trading_frequency,
                }
            }
            1 => {
                if instruction_data.len() < 5 {
                    return Err(ProgramError::InvalidInstructionData);
                }
                let amount = u32::from_le_bytes([
                    instruction_data[1],
                    instruction_data[2],
                    instruction_data[3],
                    instruction_data[4],
                ]);
                BitcellInstruction::DepositFunds { amount }
            }
            2 => {
                if instruction_data.len() < 5 {
                    return Err(ProgramError::InvalidInstructionData);
                }
                let amount = u32::from_le_bytes([
                    instruction_data[1],
                    instruction_data[2],
                    instruction_data[3],
                    instruction_data[4],
                ]);
                BitcellInstruction::WithdrawProfits { amount }
            }
            3 => BitcellInstruction::CheckMaturity,
            _ => return Err(ProgramError::InvalidInstructionData),
        }
    } else {
        return Err(ProgramError::InvalidInstructionData);
    };

    // Process the instruction
    match instruction {
        BitcellInstruction::InitializeCell {
            initial_deposit,
            maturity_period,
            risk_tolerance,
            max_drawdown,
            trading_frequency,
        } => {
            msg!("Instruction: InitializeCell");
            process_initialize_cell(
                program_id, 
                accounts, 
                initial_deposit, 
                maturity_period,
                risk_tolerance,
                max_drawdown,
                trading_frequency
            )
        }
        BitcellInstruction::DepositFunds { amount } => {
            msg!("Instruction: DepositFunds");
            process_deposit_funds(program_id, accounts, amount)
        }
        BitcellInstruction::WithdrawProfits { amount } => {
            msg!("Instruction: WithdrawProfits");
            process_withdraw_profits(program_id, accounts, amount)
        }
        BitcellInstruction::CheckMaturity => {
            msg!("Instruction: CheckMaturity");
            process_check_maturity(program_id, accounts)
        }
        BitcellInstruction::UpdateSettings { 
            risk_tolerance, 
            max_drawdown, 
            trading_frequency 
        } => {
            msg!("Instruction: UpdateSettings");
            process_update_settings(program_id, accounts, risk_tolerance, max_drawdown, trading_frequency)
        }
    }
}

// Process the InitializeCell instruction
fn process_initialize_cell(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    initial_deposit: u32,
    maturity_period: u32,
    risk_tolerance: u8,
    max_drawdown: u8,
    trading_frequency: u16,
) -> ProgramResult {
    // Get the account iterator
    let account_info_iter = &mut accounts.iter();
    
    // Get the accounts
    let payer_account = next_account_info(account_info_iter)?;
    let cell_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;
    
    // Ensure the payer is the signer
    if !payer_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Create the cell account
    let rent = Rent::get()?;
    let space = size_of::<BitcellAccount>();
    let lamports = rent.minimum_balance(space);
    
    // Create the account
    invoke(
        &system_instruction::create_account(
            payer_account.key,
            cell_account.key,
            lamports,
            space as u64,
            program_id,
        ),
        &[
            payer_account.clone(),
            cell_account.clone(),
            system_program.clone(),
        ],
    )?;
    
    // Initialize the account data
    let cell_data = BitcellAccount {
        owner: *payer_account.key,
        locked_funds: initial_deposit as f32,
        available_profits: 0.0,
        maturity_timestamp: solana_program::clock::Clock::get()?.unix_timestamp as u64 + (maturity_period as u64 * 24 * 60 * 60),
        health: 100,
        active_positions: 0,
        total_trades: 0,
        success_rate: 0,
        is_initialized: true,
        risk_tolerance,
        max_drawdown,
        trading_frequency,
    };
    
    // Serialize the account data
    let mut data = cell_account.try_borrow_mut_data()?;
    let bytes = unsafe {
        std::slice::from_raw_parts(
            &cell_data as *const BitcellAccount as *const u8,
            size_of::<BitcellAccount>(),
        )
    };
    data[..bytes.len()].copy_from_slice(bytes);
    
    Ok(())
}

// Process the DepositFunds instruction
fn process_deposit_funds(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u32,
) -> ProgramResult {
    // Get the account iterator
    let account_info_iter = &mut accounts.iter();
    
    // Get the accounts
    let payer_account = next_account_info(account_info_iter)?;
    let cell_account = next_account_info(account_info_iter)?;
    
    // Ensure the payer is the signer
    if !payer_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Ensure the cell account is owned by the program
    if cell_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Get the cell data
    let mut data = cell_account.try_borrow_mut_data()?;
    let cell_data = unsafe { &mut *(data.as_mut_ptr() as *mut BitcellAccount) };
    
    // Ensure the cell is initialized
    if !cell_data.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    
    // Ensure the payer is the owner of the cell
    if cell_data.owner != *payer_account.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Update the locked funds
    cell_data.locked_funds += amount as f32;
    
    Ok(())
}

// Process the WithdrawProfits instruction
fn process_withdraw_profits(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    amount: u32,
) -> ProgramResult {
    // Get the account iterator
    let account_info_iter = &mut accounts.iter();
    
    // Get the accounts
    let payer_account = next_account_info(account_info_iter)?;
    let cell_account = next_account_info(account_info_iter)?;
    
    // Ensure the payer is the signer
    if !payer_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Ensure the cell account is owned by the program
    if cell_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Get the cell data
    let mut data = cell_account.try_borrow_mut_data()?;
    let cell_data = unsafe { &mut *(data.as_mut_ptr() as *mut BitcellAccount) };
    
    // Ensure the cell is initialized
    if !cell_data.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    
    // Ensure the payer is the owner of the cell
    if cell_data.owner != *payer_account.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Ensure there are enough profits to withdraw
    if cell_data.available_profits < amount as f32 {
        return Err(ProgramError::InsufficientFunds);
    }
    
    // Update the available profits
    cell_data.available_profits -= amount as f32;
    
    Ok(())
}

// Process the CheckMaturity instruction
fn process_check_maturity(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    // Get the account iterator
    let account_info_iter = &mut accounts.iter();
    
    // Get the accounts
    let payer_account = next_account_info(account_info_iter)?;
    let cell_account = next_account_info(account_info_iter)?;
    
    // Ensure the payer is the signer
    if !payer_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Ensure the cell account is owned by the program
    if cell_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Get the cell data
    let data = cell_account.try_borrow_data()?;
    let cell_data = unsafe { &*(data.as_ptr() as *const BitcellAccount) };
    
    // Ensure the cell is initialized
    if !cell_data.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    
    // Ensure the payer is the owner of the cell
    if cell_data.owner != *payer_account.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Check if the maturity period has passed
    let current_time = solana_program::clock::Clock::get()?.unix_timestamp as u64;
    if current_time >= cell_data.maturity_timestamp {
        msg!("Maturity period has passed. Funds can be withdrawn.");
    } else {
        msg!("Maturity period has not passed yet. Funds are still locked.");
    }
    
    Ok(())
}

// Process the UpdateSettings instruction
fn process_update_settings(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    risk_tolerance: u8,
    max_drawdown: u8,
    trading_frequency: u16,
) -> ProgramResult {
    // Get the account iterator
    let account_info_iter = &mut accounts.iter();
    
    // Get the accounts
    let owner_account = next_account_info(account_info_iter)?;
    let cell_account = next_account_info(account_info_iter)?;
    
    // Ensure the owner is the signer
    if !owner_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    
    // Ensure the cell account is owned by the program
    if cell_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }
    
    // Get the cell data
    let mut data = cell_account.try_borrow_mut_data()?;
    let cell_data = unsafe { &mut *(data.as_mut_ptr() as *mut BitcellAccount) };
    
    // Ensure the cell is initialized
    if !cell_data.is_initialized {
        return Err(ProgramError::UninitializedAccount);
    }
    
    // Ensure the owner is the owner of the cell
    if cell_data.owner != *owner_account.key {
        return Err(ProgramError::InvalidAccountData);
    }
    
    // Update the settings
    cell_data.risk_tolerance = risk_tolerance;
    cell_data.max_drawdown = max_drawdown;
    cell_data.trading_frequency = trading_frequency;
    
    msg!("Cell settings updated successfully");
    
    Ok(())
}
