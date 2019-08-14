pragma solidity ^0.5.6;

contract MedicalData{
    event NewUser(uint id,string company);
    address public owner; //=>msg.sender

    struct User{
         string company;//회사명
         mapping (string => uint)LookCnt; //유저 조회 횟수
         mapping (string => uint)DownloadCnt; //유저 다운로드 횟수
         uint ConnectCnt; //유저 접속 횟수
    }
    
    User[] public users; //유저 저장 배열
    mapping(address => uint) public userAddressToId; //유저 id에 address mapping

    constructor() public {
        owner = msg.sender;
        login("manager");
    }
    
    function createUser(string memory company) public {
        User memory userInfo;
        userInfo.company = company;
        uint id = users.push(userInfo)-1; //id값 부여
        userAddressToId[msg.sender] = id; //id값에 유저 address mapping
        emit NewUser(id,company); //이벤트 발생(프론트 전달)
    }

    function getLookCount(address add,string memory file) public view returns (uint) {
        return users[userAddressToId[add]].LookCnt[file];
    }
    
    function getDownloadCount(address add,string memory file) public view returns (uint) {
        return users[userAddressToId[add]].DownloadCnt[file];
    }

    function getLoginCount(address add) public view returns (uint){
        return users[userAddressToId[add]].ConnectCnt;
    }

    function getCompany(address add)public view returns (string memory){
        return users[userAddressToId[add]].company;
    }

    function Download(uint nums,string memory file) public {
        users[userAddressToId[msg.sender]].DownloadCnt[file]+=nums;
    }

    function reading(uint nums,string memory file) public {
        users[userAddressToId[msg.sender]].LookCnt[file]+=nums;
    }

    function login(string memory company) public {
         if(userAddressToId[msg.sender]==0)
             createUser(company);
        users[userAddressToId[msg.sender]].ConnectCnt++;
    }

    function findUsers(address add)public view returns(string memory company,uint connect){
        require(msg.sender==owner); //관리자만 가능하게
        uint id = userAddressToId[add];
        return (users[id].company,users[id].ConnectCnt);
    }
    
    function findDataAccess(address add,string memory file)public view returns(uint Look,uint Download)
    {
        require(msg.sender==owner);
        uint id = userAddressToId[add];
        return(users[id].LookCnt[file],users[id].DownloadCnt[file]);
    }

    function () external payable{}
}
