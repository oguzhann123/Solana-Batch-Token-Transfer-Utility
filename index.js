const { Connection, PublicKey, Transaction, Keypair, sendAndConfirmTransaction } = require('@solana/web3.js');
const { createTransferInstruction, TOKEN_PROGRAM_ID, getOrCreateAssociatedTokenAccount } = require('@solana/spl-token');
const bs58 = require('bs58');

// Connect to the Solana network
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

// Get the private key from an environment variable
const secretKeyBase58 = process.env.SOLANA_PRIVATE_KEY; // Set this variable in your environment
const payer = Keypair.fromSecretKey(bs58.decode(secretKeyBase58));

// Token mint address (the address of the token you want to send)
const tokenMint = new PublicKey('3QCf8rb4bjQzSKC58wagLK5i4SaM3N27jE147mw4pump');

// List of recipient wallet addresses
const recipientAddresses = [
  '2ePCdrY2xp4wmJ1tNStv23YRkCgQ1mr7s1aGLgQhUJoS'
];

// Define how many tokens to send to each wallet (adjusted for decimals)
const amountToSend = 10 * 10 ** 6; // For a token with 6 decimals

// Main function to perform the token transfer
(async () => {
  try {
    // Get or create the sender's token account
    const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      tokenMint,
      payer.publicKey
    );

    // Create a new transaction
    const transaction = new Transaction();

    // Loop through each recipient address
    for (let recipient of recipientAddresses) {
      // Convert recipient address to PublicKey
      const recipientPublicKey = new PublicKey(recipient);

      // Get or create the recipient's token account
      const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        payer,
        tokenMint,
        recipientPublicKey
      );

      // Add the transfer instruction to the transaction
      transaction.add(
        createTransferInstruction(
          senderTokenAccount.address,
          recipientTokenAccount.address,
          payer.publicKey,
          amountToSend,
          [], // Additional signers (none in this case)
          TOKEN_PROGRAM_ID
        )
      );
    }

    // Send and confirm the transaction if there are any instructions
    if (transaction.instructions.length > 0) {
      const signature = await sendAndConfirmTransaction(connection, transaction, [payer]);
      console.log('Transfer successful! Transaction signature:', signature);
    } else {
      console.log('No instructions provided, no transfer performed.');
    }
  } catch (error) {
    // Print the error if something goes wrong
    console.error('Error during transfer:', error);
  }
})();
