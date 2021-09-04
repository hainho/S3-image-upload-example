require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY

// 서버에서 S3에 접근하려면 accessKeyId와 secretAccessKey가 필요하다.
// 이 두개의 키는 AWS에서 S3에 접근 가능한 IAM User를 생성하면 발급된다.
// IAM란 Identity and Access Management의 약자로, AWS 리소스에 대한 액세스를 안전하게 제어할 수 있는 웹 서비스다.
// IAM을 사용하여 리소스를 사용하도록 인증(로그인) 및 권한 부여(권한 있음)된 대상을 제어합니다.
const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey
})

// uploads a file to s3
function uploadFile(file) {

  //file의 경로에서 파일을 읽어오는 스트림 생성
  const fileStream = fs.createReadStream(file.path)

  //S3 접근에 필요한 정보를 담고 있는 Param 객체 생성
  const uploadParams = {

    //AWS S3에 만들어 놓은 버킷 이름이다.
    Bucket: bucketName,

    //저장되는 데이터이다. String, Buffer, Stream 이 올 수 있다.
    Body: fileStream,

    //S3에 저장될 위치. 참고로 존재하지 않는 디렉터리를 명시하면 자동으로 디렉터리가 생성된다.
    Key: file.filename
  }

  //이미지 업로드 프로미스 리턴
  return s3.upload(uploadParams).promise()
}
exports.uploadFile = uploadFile


// downloads a file from s3
function getFileStream(fileKey) {

  //S3 접근에 필요한 정보를 담고 있는 Param 객체 생성
  const downloadParams = {

    //가져올 파일의 키
    Key: fileKey,

    //AWS S3에 만들어 놓은 버킷 이름이다.
    Bucket: bucketName
  }

  //s3에서 파일을 읽어오는 스트림 생성하여 리턴
  return s3.getObject(downloadParams).createReadStream()
}
exports.getFileStream = getFileStream