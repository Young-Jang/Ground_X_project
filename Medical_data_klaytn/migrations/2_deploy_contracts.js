const fs = require('fs')
const MedicalData = artifacts.require('./MedicalData.sol')

module.exports = function (deployer) {
    deployer.deploy(MedicalData)
    .then(()=>{
      if(MedicalData._json){
          fs.writeFile('deployedABI',JSON.stringify(MedicalData._json.abi),
            (err)=>{
                if(err) throw err;
                console.log("파일에 ABI 입력 성공");
            }
          )
          fs.writeFile('deployedAddress',MedicalData.address,
            (err)=>{
                if(err) throw err;
                console.log("파일에 주소 입력 성공");
            })
      }
    })
  }
  