import { exec } from 'child_process';
import * as fs from 'fs';

// Define file paths and passphrase
const INPUT_FILE_PATH = 'forsikringPoc.json'; // Replace with your actual input file path
const ENCRYPTED_FILE_PATH = 'forsikringPoc.json.enc';
const DECRYPTED_FILE_PATH = 'decrypted_forsikringPoc.json';
const PASSPHRASE = 's3cr3t-p@ssw0rd'; // Replace with your secure passphrase

// Function to run a shell command and return the output as a Promise
const runCommand = (command: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                reject(error); // Reject only if there's an actual error
                return;
            }
            if (stderr) {
                console.warn(`stderr: ${stderr}`); // Log stderr as a warning but don't reject
            }
            console.log(`stdout: ${stdout}`);
            resolve(); // Resolve even if there's some non-fatal stderr output
        });
    });
};

// Function to encrypt a file using a passphrase with AES-256-CBC
const encryptFile = async () => {
    const command = `openssl enc -aes-256-cbc -salt -in "${INPUT_FILE_PATH}" -out "${ENCRYPTED_FILE_PATH}" -pass pass:"${PASSPHRASE}"`;
    console.log(`Encrypting file: ${INPUT_FILE_PATH}...`);
    await runCommand(command).catch(() => console.error('Failed to encrypt the file'));
    console.log(`File encrypted successfully as: ${ENCRYPTED_FILE_PATH}`);
};

// Function to decrypt a file using a passphrase with AES-256-CBC
const decryptFile = async () => {
    const command = `openssl enc -d -aes-256-cbc -in "${ENCRYPTED_FILE_PATH}" -out "${DECRYPTED_FILE_PATH}" -pass pass:"${PASSPHRASE}"`;
    console.log(`Decrypting file: ${ENCRYPTED_FILE_PATH}...`);
    await runCommand(command).catch(() => console.error('Failed to decrypt the file'));
    console.log(`File decrypted successfully as: ${DECRYPTED_FILE_PATH}`);
};

// Main function to automate encryption and decryption
const main = async () => {
    try {
        // Encrypt the file
        await encryptFile();

        // Decrypt the file
        await decryptFile();

        console.log("Encryption and decryption process completed.");
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

main();