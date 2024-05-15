# /bin/sh
CHARTS="/Users/samuel/desktop/sellout/src/SelloutPlatform/charts/sellout"

if [ -z "$1" ]
then
  1=$sellout_LAST_DEPLOYMENT
else 
  export sellout_LAST_DEPLOYMENT=$1
fi

helm upgrade --install sellout $CHARTS --set global.imageTag=$1 --namespace=default --force