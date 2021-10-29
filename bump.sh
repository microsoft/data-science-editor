git pull
cd jacdac-ts
git pull
cd ../react-jacdac
git pull
ncu -u
yarn install
git commit -am "patch: update dependencies"
git push
cd ../node-red-contrib-jacdac
git pull
ncu -u
yarn install
git commit -am "patch: update dependencies"
git push
cd ..
git commit -am "patch: updated jacdac-ts repositories"
git push
