import { execSync } from 'child_process';

const PORT = 5000;

function cleanup() {
    console.log(`[Cleanup] Checking port ${PORT}...`);
    try {
        let command;
        if (process.platform === 'win32') {
            command = `netstat -ano | findstr :${PORT}`;
        } else {
            command = `lsof -i :${PORT} -t`;
        }

        const output = execSync(command).toString().trim();
        if (output) {
            const lines = output.split('\n');
            const pids = new Set();

            lines.forEach(line => {
                const parts = line.trim().split(/\s+/);
                if (process.platform === 'win32') {
                    const pid = parts[parts.length - 1];
                    if (pid && !isNaN(pid)) pids.add(pid);
                } else {
                    pids.add(line.trim());
                }
            });

            pids.forEach(pid => {
                console.log(`[Cleanup] Killing process ${pid} on port ${PORT}...`);
                try {
                    execSync(process.platform === 'win32' ? `taskkill /F /PID ${pid} /T` : `kill -9 ${pid}`);
                } catch (e) {
                    console.error(`[Cleanup] Failed to kill ${pid}: ${e.message}`);
                }
            });
        } else {
            console.log(`[Cleanup] Port ${PORT} is already clear.`);
        }
    } catch (error) {
        if (error.status === 1) {
            console.log(`[Cleanup] Port ${PORT} is clear.`);
        } else {
            console.error(`[Cleanup] Error: ${error.message}`);
        }
    }
}

cleanup();
