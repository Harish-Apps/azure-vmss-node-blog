# Node.js Personal Blog on Azure VM Scale Set

End-to-end example:
- Terraform provisions RG, VNet/Subnet/NSG, Public LB (80→3000), and a VMSS (Ubuntu 22.04)
- Cloud-init installs Node.js + PM2, clones this repo, and starts the app on port 3000
- GitHub Actions deploys on every push to `main` by pulling changes on all VMSS instances

## Prerequisites

- Azure subscription + Owner/Contributor on the target sub
- Terraform >= 1.6
- Azure CLI (`az`) installed and logged in (`az login`)
- An SSH key (`ssh-keygen -t ed25519`)
- A **public GitHub repo** (repo must be public so VMs can `git clone`/`git pull` without secrets)

> If you need a private repo, we can switch to deploy keys or MSI + GitHub token later—ask me next.

## 1) Fork or create this repo

- Put this code in a public GitHub repo (e.g., `azure-vmss-node-blog`).
- Ensure the repo default branch is `main`.

## 2) Configure GitHub OIDC to Azure (no secrets)

- Create an Entra App Registration and Federated Credential for this repo:

```bash
SUB="<your-subscription-id>"
TENANT="<your-tenant-id>"
APP_NAME="gh-oidc-node-blog"

az ad app create --display-name "$APP_NAME"
APP_ID=$(az ad app list --display-name "$APP_NAME" --query "[0].appId" -o tsv)

# Create a service principal for the app and assign rights on the subscription
az ad sp create --id "$APP_ID"
az role assignment create --assignee "$APP_ID" --role "Contributor" --scope "/subscriptions/$SUB"

# Add a federated credential (replace owner/repo/branch)
OWNER="<your-github-username-or-org>"
REPO="azure-vmss-node-blog"
cat > fed.json <<EOF
{
  "name": "gh-oidc-main",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:${OWNER}/${REPO}:ref:refs/heads/main",
  "audiences": ["api://AzureADTokenExchange"]
}
EOF
az ad app federated-credential create --id "$APP_ID" --parameters @fed.json
