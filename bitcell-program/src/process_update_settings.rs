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
