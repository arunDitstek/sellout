export PROJECT_ID="$(gcloud projects describe $(gcloud config get-value core/project -q) --format='get(projectNumber)')"
export SERVICE_ACCOUNT="${PROJECT_ID}@cloudbuild.gserviceaccount.com"

# Add IAM policy for cloudbuild cluster administration
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member=serviceAccount:${SERVICE_ACCOUNT} \
  --role=roles/container.admin

# and add a clusterrolebinding
kubectl create clusterrolebinding cluster-admin-${SERVICE_ACCOUNT} \
  --clusterrole cluster-admin --user ${SERVICE_ACCOUNT}