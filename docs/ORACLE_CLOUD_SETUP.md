# Oracle Cloud Setup & Deployment Guide

This guide walks you through deploying ClawdHost to Oracle Cloud Free Tier with automated CI/CD.

## Prerequisites

- An Oracle Cloud account (free tier eligible)
- GitHub repository access
- A domain name (optional, for SSL/HTTPS)

## Step 1: Create Oracle Cloud Account

1. Go to [Oracle Cloud Free Tier](https://www.oracle.com/cloud/free/)
2. Click "Start for free"
3. Create your account with email, name, and address
4. Choose your home region (e.g., us-ashburn-1, us-phoenix-1)
5. Complete identity verification

The Always Free tier includes:
- **2 ARM Compute instances** (4 OCPUs, 24GB RAM each)
- **2 Always Free Databases** (MySQL, Autonomous Database)
- **200GB storage**, **10TB bandwidth** per month
- **Load Balancer, VCN, etc.**

## Step 2: Generate API Keys

You need API keys to authenticate Terraform with Oracle Cloud.

### 2.1 Generate API Key Pair

1. Log in to Oracle Cloud Console
2. Click your profile avatar (top-right) → **User Settings**
3. Scroll down to "API Keys" section
4. Click **Add API Key**
5. Select "Generate API Key Pair"
6. Click **Download Private Key** and save it securely
   - The private key file will be named something like `oraclecloud_api_key.pem`
7. Click **Add** to create the key
8. **Copy and save the configuration** shown (you'll need this)

### 2.2 Save API Key

```bash
# Create .oci directory if it doesn't exist
mkdir -p ~/.oci

# Move the private key there
mv ~/Downloads/oraclecloud_api_key.pem ~/.oci/oci_api_key.pem

# Set correct permissions (important!)
chmod 600 ~/.oci/oci_api_key.pem
```

### 2.3 Note Your OCIDs

From the configuration displayed after creating the key, note:
- **Tenancy OCID**: `ocid1.tenancy.oc1...`
- **User OCID**: `ocid1.user.oc1...`
- **Fingerprint**: `xx:xx:xx:...`

## Step 3: Generate SSH Key for VM Access

This SSH key will allow you and the CI/CD workflow to access the VM.

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -f ~/.ssh/clawdhost -N ""

# Display the public key (you'll need to paste this in Terraform)
cat ~/.ssh/clawdhost.pub
```

Save the output somewhere safe - you'll need it for the Terraform variables.

## Step 4: Create Terraform Variables File

1. Copy the example file:
   ```bash
   cp terraform/infra/terraform.tfvars.example terraform/infra/terraform.tfvars
   ```

2. Edit `terraform/infra/terraform.tfvars` and fill in your values:
   ```hcl
   tenancy_ocid     = "ocid1.tenancy.oc1..xxxxx"      # From step 2.3
   user_ocid        = "ocid1.user.oc1..xxxxx"         # From step 2.3
   fingerprint      = "xx:xx:xx:xx:..."               # From step 2.3
   private_key_path = "~/.oci/oci_api_key.pem"        # Path to your API private key
   region           = "us-ashburn-1"                  # Your home region
   ssh_public_key   = "ssh-rsa AAAAB3..."             # From step 3
   ```

## Step 5: Deploy Infrastructure with Terraform

```bash
# Navigate to Terraform directory
cd terraform/infra

# Initialize Terraform (downloads providers and modules)
terraform init

# Review planned changes
terraform plan

# Apply changes (creates VPC, subnet, security groups, and VM)
terraform apply
```

Terraform will create:
- VCN (Virtual Cloud Network)
- Public subnet
- Internet Gateway
- Route table with internet route
- Security groups (allowing SSH, HTTP, HTTPS)
- Ubuntu 24.04 LTS ARM Compute instance with Docker, Node.js, and nginx

### After Apply

When Terraform finishes, it will output:
- **instance_public_ip**: The public IP of your VM
- **ssh_command**: Command to SSH into your VM

Example:
```
instance_public_ip = "192.0.2.42"
ssh_command = "ssh -i ~/.ssh/clawdhost ubuntu@192.0.2.42"
```

## Step 6: Verify VM Setup

SSH into your new VM and verify everything is installed:

```bash
# SSH into the VM
ssh -i ~/.ssh/clawdhost ubuntu@<instance_public_ip>

# Verify Docker is running
docker --version
docker ps

# Verify Moltbot image was pulled
docker images | grep moltbot

# Verify Node.js
node --version

# Check that app directories exist
ls -la /opt/clawdhost/
ls -la /opt/clawdhost/data/

# Verify nginx is running
sudo systemctl status nginx

# Verify the systemd service exists
sudo systemctl status clawdhost
# (Should show "inactive" until we deploy code)
```

## Step 7: Set Up GitHub Secrets for CI/CD

The GitHub Actions workflow requires these secrets to automatically deploy updates:

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Create the following secrets:

| Secret | Value |
|--------|-------|
| `VM_HOST` | Public IP from Terraform output (e.g., `192.0.2.42`) |
| `VM_USER` | `ubuntu` |
| `VM_SSH_KEY` | Contents of `~/.ssh/clawdhost` (private key) |
| `CLERK_SECRET_KEY` | Your Clerk secret key from `.env` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key from `.env` |

### Get SSH Private Key Content

```bash
# Display the private key content
cat ~/.ssh/clawdhost

# Copy the entire output, including the BEGIN and END lines
```

Paste the entire private key as the `VM_SSH_KEY` secret.

## Step 8: Deploy with GitHub Actions

Push a change to the `main` branch to trigger deployment:

```bash
git add .
git commit -m "Deploy to Oracle Cloud"
git push origin main
```

The GitHub Actions workflow will:
1. Build the frontend and backend
2. Copy compiled files to the VM
3. Create the `.env` file with secrets
4. Install production dependencies
5. Restart the ClawdHost service
6. Verify the service is running

Monitor the workflow:
1. Go to GitHub repository
2. Click "Actions" tab
3. Click the latest workflow run
4. View logs for each step

## Step 9: Access Your App

After the first deployment succeeds:

1. Open your browser
2. Go to `http://<instance_public_ip>`
3. Sign in with Clerk
4. Create a Moltbot instance
5. Test the chat interface

## Step 10: Set Up SSL/HTTPS (Optional but Recommended)

To enable secure HTTPS and WSS (WebSocket Secure):

### 10.1 Get a Domain Name

You'll need a domain pointing to your VM's public IP:

```bash
# Add A record in your domain registrar
# A record: <your-domain> → <instance_public_ip>
```

### 10.2 Wait for DNS Propagation

```bash
# Verify DNS is working (wait 10 minutes - 24 hours)
nslookup your-domain.com
```

### 10.3 Run Certbot on the VM

```bash
# SSH into the VM
ssh -i ~/.ssh/clawdhost ubuntu@<instance_public_ip>

# Run certbot to get SSL certificate
sudo certbot --nginx -d your-domain.com --non-interactive --agree-tos -m your-email@example.com

# Verify HTTPS works
sudo systemctl reload nginx
```

### 10.4 Verify HTTPS

```bash
# Test HTTPS
curl -I https://your-domain.com

# Check certificate expiry
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

Certbot will auto-renew your certificate. No manual action needed!

## Troubleshooting

### Terraform Apply Fails

**Error: "Shape validation failed"**
- Check that your tenancy OCID and user OCID are correct
- Ensure the API key fingerprint matches

**Error: "Invalid fingerprint"**
- Go back to User Settings → API Keys
- Verify the fingerprint matches exactly

### Deployment Fails

**Error: "Permission denied (publickey)"**
- Verify `VM_SSH_KEY` secret contains the full private key (including `-----BEGIN RSA PRIVATE KEY-----`)
- Ensure the SSH key is in the correct format

**Error: "Failed to connect to host"**
- Verify `VM_HOST` secret contains the correct public IP
- Check that the VM is running in Oracle Cloud console
- Security groups might have blocking rules

### Can't Access App

**Error: "Connection refused" on port 80**
- SSH into VM and check nginx status: `sudo systemctl status nginx`
- Check security group allows port 80: `sudo iptables -L`

**WebSocket connection fails**
- Ensure the backend service is running: `sudo systemctl status clawdhost`
- Check logs: `sudo journalctl -u clawdhost -f`

## Monitoring & Logs

### Check Service Status

```bash
ssh -i ~/.ssh/clawdhost ubuntu@<instance_public_ip>

# Backend service
sudo systemctl status clawdhost
sudo journalctl -u clawdhost -f  # Follow logs

# Nginx web server
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log

# Docker containers
docker ps
docker logs <container_id>
```

### Database

The SQLite database is stored at `/opt/clawdhost/data/clawdhost.db`.

To inspect:
```bash
ssh -i ~/.ssh/clawdhost ubuntu@<instance_public_ip>
sudo sqlite3 /opt/clawdhost/data/clawdhost.db ".tables"
sudo sqlite3 /opt/clawdhost/data/clawdhost.db "SELECT * FROM instances;"
```

## Updating the App

Simply push changes to `main` branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

GitHub Actions will automatically:
- Build the new code
- Deploy to Oracle Cloud VM
- Restart the service
- Verify it's running

## Cost

ClawdHost runs **completely free** on Oracle Cloud Free Tier:
- 1 Always Free ARM Compute instance (4 OCPUs, 24GB RAM)
- No time limit - free forever
- Included load balancer, VCN, storage, and bandwidth

If you exceed Always Free limits, you'll be notified with a 30-day grace period to scale back down.

## Need Help?

- [Oracle Cloud Documentation](https://docs.oracle.com/en-us/iaas/)
- [Terraform OCI Provider](https://registry.terraform.io/providers/oracle/oci/latest/docs)
- Check the troubleshooting section above
