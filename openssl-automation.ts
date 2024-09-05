import { exec } from 'child_process';
import * as fs from 'fs';

const INPUT_FILE_PATH = 'forsikringPoc.json';
const ENCRYPTED_FILE_PATH_SYMMETRIC = 'file-symmetric.forsikringPoc.json.enc';
const DECRYPTED_FILE_PATH_SYMMETRIC = 'file-symmetric.forsikringPoc.json';
const PASSWORD_FILE_PATH = 'pass.txt';
const ENCRYPTED_PASSWORD_FILE_PATH = 'pass.txt.enc';
const DECRYPTED_PASSWORD_FILE_PATH = 'pass-decrypted.txt';
const PRIVATE_KEY_PATH = 'key.pem';
const PUBLIC_KEY_PATH = 'key.pub';

// Function to run a shell command and return the output as a Promise
const runCommand = (command: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.warn(`Warning: ${stderr}`); // Log warnings from stderr
            }
            console.log(`stdout: ${stdout}`);
            resolve();
        });
    });
};

// Function to generate RSA key pair
const generateRSAKeys = async () => {
    console.log("Generating RSA keys...");
    await runCommand(`openssl genrsa -out ${PRIVATE_KEY_PATH}`)
        .catch(() => console.error('Failed to generate RSA private key'));
    await runCommand(`openssl rsa -in ${PRIVATE_KEY_PATH} -out ${PUBLIC_KEY_PATH} -pubout`)
        .catch(() => console.error('Failed to generate RSA public key'));
    console.log("RSA keys generated successfully.");
};

// Function to encrypt the symmetric password using RSA public key
const encryptPasswordWithPublicKey = async () => {
    const command = `openssl rsautl -encrypt -inkey "${PUBLIC_KEY_PATH}" -pubin -in "${PASSWORD_FILE_PATH}" -out "${ENCRYPTED_PASSWORD_FILE_PATH}"`;
    console.log(`Encrypting password using public key...`);
    await runCommand(command).catch(() => console.error('Failed to encrypt password with public key'));
    console.log(`Password encrypted successfully as: ${ENCRYPTED_PASSWORD_FILE_PATH}`);
};

// Function to decrypt the symmetric password using RSA private key
const decryptPasswordWithPrivateKey = async () => {
    const command = `openssl rsautl -decrypt -inkey "${PRIVATE_KEY_PATH}" -in "${ENCRYPTED_PASSWORD_FILE_PATH}" -out "${DECRYPTED_PASSWORD_FILE_PATH}"`;
    console.log(`Decrypting password using private key...`);
    await runCommand(command).catch(() => console.error('Failed to decrypt password with private key'));
    console.log(`Password decrypted successfully as: ${DECRYPTED_PASSWORD_FILE_PATH}`);
};

// Function to encrypt a file symmetrically using the decrypted password
const encryptFileSymmetric = async () => {
    const command = `openssl enc -aes-256-cbc -salt -in "${INPUT_FILE_PATH}" -out "${ENCRYPTED_FILE_PATH_SYMMETRIC}" -pass file:"${PASSWORD_FILE_PATH}"`;
    console.log(`Encrypting file: ${INPUT_FILE_PATH} symmetrically...`);
    await runCommand(command).catch(() => console.error('Failed to encrypt file symmetrically'));
    console.log(`File encrypted successfully as: ${ENCRYPTED_FILE_PATH_SYMMETRIC}`);
};

// Function to decrypt a file symmetrically using the decrypted password
const decryptFileSymmetric = async () => {
    const command = `openssl enc -d -aes-256-cbc -in "${ENCRYPTED_FILE_PATH_SYMMETRIC}" -out "${DECRYPTED_FILE_PATH_SYMMETRIC}" -pass file:"${DECRYPTED_PASSWORD_FILE_PATH}"`;
    console.log(`Decrypting file: ${ENCRYPTED_FILE_PATH_SYMMETRIC} symmetrically...`);
    await runCommand(command).catch(() => console.error('Failed to decrypt file symmetrically'));
    console.log(`File decrypted successfully as: ${DECRYPTED_FILE_PATH_SYMMETRIC}`);
};

// Main function to automate encryption and decryption
const main = async () => {
    try {
        // Generate RSA keys
        await generateRSAKeys();

        // Create a password file for symmetric encryption
        fs.writeFileSync(PASSWORD_FILE_PATH, 's3cr3t-p@ssw0rd');

        // Encrypt the symmetric password file using RSA public key
        await encryptPasswordWithPublicKey();

        // Decrypt the symmetric password file using RSA private key
        await decryptPasswordWithPrivateKey();

        // Encrypt and decrypt the JSON file symmetrically using the decrypted password
        await encryptFileSymmetric();
        await decryptFileSymmetric();

        console.log("Encryption and decryption process completed.");
    } catch (error) {
        console.error('An error occurred:', error);
    }
};

main();

