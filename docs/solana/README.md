# Solana Program Documentation

The BitCell Solana program is written in Rust and handles the core blockchain logic for cell management, deposits, withdrawals, and profit calculations.

## Program Overview

- **Program ID**: `BitC1177777777777777777777777777777777777777` (devnet)
- **Language**: Rust
- **Framework**: Solana Program Library
- **Serialization**: Borsh

## Architecture

### Account Structure

#### BitcellAccount

```rust
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct BitcellAccount {
    pub owner: Pubkey,           // Owner's wallet address
    pub energy: u64,             // Current energy level
    pub growth_level: u32,       // Growth progression
    pub last_update: i64,        // Unix timestamp of last update
    pub total_deposited: u64,    // Total SOL deposited
    pub profits_earned: u64,     // Accumulated profits
    pub is_mature: bool,         // Whether cell is ready for harvest
}
```

### Instructions

#### BitcellInstruction

```rust
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum BitcellInstruction {
    /// Initialize a new BitCell
    /// Accounts:
    /// 0. [writable, signer] Cell account to initialize
    /// 1. [signer] Owner account
    /// 2. [] System program
    InitializeCell { initial_energy: u64 },
    
    /// Deposit funds to a cell
    /// Accounts:
    /// 0. [writable] Cell account
    /// 1. [writable, signer] Owner account
    /// 2. [] System program
    DepositFunds { amount: u64 },
    
    /// Withdraw profits from a mature cell
    /// Accounts:
    /// 0. [writable] Cell account
    /// 1. [writable, signer] Owner account
    /// 2. [] System program
    WithdrawProfits { amount: u64 },
    
    /// Check and update cell maturity
    /// Accounts:
    /// 0. [writable] Cell account
    /// 1. [signer] Owner account
    CheckMaturity,
}
```

## Program Functions

### initialize_cell

Creates a new BitCell account with initial parameters.

**Parameters:**
- `initial_energy: u64` - Starting energy level (minimum 100)

**Logic:**
1. Validates that the cell account is not already initialized
2. Sets the owner to the signer's public key
3. Initializes energy, growth level, and timestamps
4. Marks the account as initialized

```rust
pub fn initialize_cell(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    initial_energy: u64,
) -> ProgramResult {
    // Implementation details...
}
```

### deposit_funds

Deposits SOL into a BitCell to increase its energy and growth potential.

**Parameters:**
- `amount: u64` - Amount of lamports to deposit

**Logic:**
1. Validates ownership of the cell
2. Transfers SOL from owner to cell account
3. Updates cell's energy based on deposit amount
4. Recalculates growth level and maturity status

**Energy Calculation:**
```
new_energy = current_energy + (deposit_amount * ENERGY_MULTIPLIER)
```

### withdraw_profits

Allows withdrawal of accumulated profits from mature cells.

**Parameters:**
- `amount: u64` - Amount of lamports to withdraw

**Logic:**
1. Validates cell ownership and maturity status
2. Checks that withdrawal doesn't exceed available profits
3. Transfers SOL from cell account to owner
4. Updates cell statistics and profit tracking

**Profit Calculation:**
```
profits = (current_energy * growth_level * time_factor) / PROFIT_DIVISOR
```

### check_maturity

Updates the cell's maturity status based on time and growth criteria.

**Logic:**
1. Calculates time elapsed since last update
2. Updates growth level based on energy and time
3. Determines if cell meets maturity criteria
4. Updates profits earned if mature

**Maturity Criteria:**
- Minimum growth level: 1000
- Minimum time: 24 hours since last deposit
- Energy threshold: 500+ energy points

## Constants and Configuration

```rust
// Energy and growth calculations
const ENERGY_MULTIPLIER: u64 = 10;
const GROWTH_RATE: u32 = 100;
const MATURITY_THRESHOLD: u32 = 1000;
const PROFIT_RATE: u64 = 5; // 5% base rate

// Time calculations
const SECONDS_PER_DAY: i64 = 86400;
const MIN_MATURITY_TIME: i64 = SECONDS_PER_DAY;

// Account sizes
const BITCELL_ACCOUNT_SIZE: usize = 8 + 32 + 8 + 4 + 8 + 8 + 8 + 1; // 77 bytes
```

## Error Handling

### Custom Errors

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BitcellError {
    InvalidInstruction,
    NotRentExempt,
    InsufficientFunds,
    NotMature,
    AlreadyInitialized,
    UnauthorizedAccess,
    InvalidAmount,
    CalculationOverflow,
}
```

## Building and Deployment

### Local Development

```bash
# Navigate to program directory
cd bitcell-program

# Build the program
cargo build-bpf

# Run tests
cargo test

# Check for issues
cargo clippy
```

### Deployment to Devnet

```bash
# Set to devnet
solana config set --url devnet

# Deploy program
solana program deploy target/deploy/bitcell_program.so

# Verify deployment
solana program show <PROGRAM_ID>
```

### Deployment to Mainnet

```bash
# Set to mainnet-beta
solana config set --url mainnet-beta

# Deploy with sufficient SOL for rent
solana program deploy target/deploy/bitcell_program.so --upgrade-authority <AUTHORITY_KEYPAIR>
```

## Testing

### Unit Tests

```bash
# Run all tests
cargo test

# Run specific test
cargo test test_initialize_cell

# Run with verbose output
cargo test -- --nocapture
```

### Integration Tests

```bash
# Run integration tests with local validator
solana-test-validator &
cargo test --features integration-tests
```

## Client Integration

### JavaScript/TypeScript Example

```typescript
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';

// Initialize connection
const connection = new Connection('https://api.devnet.solana.com');
const programId = new PublicKey('BitC1177777777777777777777777777777777777777');

// Create instruction
const initializeCellIx = await program.methods
  .initializeCell(new BN(100))
  .accounts({
    cellAccount: cellKeypair.publicKey,
    owner: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .instruction();

// Send transaction
const tx = new Transaction().add(initializeCellIx);
const signature = await connection.sendTransaction(tx, [wallet, cellKeypair]);
```

## Security Considerations

### Access Control
- All operations require owner signature
- Cell accounts are owned by the program
- Withdrawal limits based on actual profits earned

### Economic Security
- Minimum deposit amounts prevent spam
- Profit calculations include time-based factors
- Maximum withdrawal limits prevent economic exploits

### Technical Security
- All arithmetic operations checked for overflow
- Account validation on every instruction
- Proper error handling and state management

## Monitoring and Analytics

### Program Events

The program emits events for monitoring:

```rust
// Event structures for logging
pub struct CellInitializedEvent {
    pub cell_account: Pubkey,
    pub owner: Pubkey,
    pub initial_energy: u64,
}

pub struct DepositEvent {
    pub cell_account: Pubkey,
    pub amount: u64,
    pub new_energy: u64,
}

pub struct WithdrawalEvent {
    pub cell_account: Pubkey,
    pub amount: u64,
    pub remaining_profits: u64,
}
```

### Metrics to Track

- Total cells created
- Total SOL deposited
- Average cell maturity time
- Profit distribution patterns
- Transaction success rates

## Upgrade Path

The program is designed to be upgradeable:

1. **Data Migration**: Account structure changes handled via versioning
2. **Feature Additions**: New instructions can be added without breaking existing functionality
3. **Bug Fixes**: Critical fixes can be deployed with minimal downtime

## Troubleshooting

### Common Issues

1. **"Account not initialized"**: Ensure `initialize_cell` is called first
2. **"Insufficient funds"**: Check SOL balance before deposits
3. **"Not mature"**: Cell needs time and energy to mature
4. **"Unauthorized access"**: Only cell owner can perform operations

### Debug Tools

```bash
# Check account state
solana account <CELL_ACCOUNT_PUBKEY>

# View transaction logs
solana confirm <TRANSACTION_SIGNATURE> -v

# Monitor program logs
solana logs <PROGRAM_ID>
```

## Future Enhancements

- Multi-cell management contracts
- Cross-cell energy transfers
- Governance token integration
- Advanced profit distribution mechanisms
- Integration with other Solana protocols
