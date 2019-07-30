pragma solidity ^0.4.24;

contract MedicalData{
    event NewUser(uint id,string company);
    address public owner; //=>msg.sender

    struct User{
         string company;//회사명
         //string name; //사용자 이름(회사명으로 할지, 사용자 이름으로 할지, 둘다 할지 =>가스 고려)
         //uint num; //이름 또는 회사 동일할시 키역할
         //uint lookCount; //열람횟수 구조체에 저장할지 mapping으로 저장할지
    }
    
    User[] public users; //유저 저장 배열
    mapping(address => uint) public userLookCount;
    mapping(address => uint) public userConnectCount; 
    mapping(address => uint) public userAddressToId; //유저 id에 address mapping

    constructor() public {
        owner = msg.sender;
    }
    
    function test() public view returns(uint){
        return 5;
    }

    function createUser(string memory company) public {
        require(userConnectCount[msg.sender]==0);
        uint id = users.push(User(company))-1; //id값 부여
        userAddressToId[msg.sender] = id; //id값에 유저 address mapping
        //emit NewUser(id,company); //이벤트 발생(프론트 전달)
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
    
    function getCompany(address add)public view returns (string memory){
        return users[userAddressToId[add]].company;
    }

    function getCount(address add) public view returns (uint) {
        return userLookCount[add];
    }

    function getLoginCount(address add) public view returns (uint){
        return userConnectCount[add];
    }

    function reading(uint nums) public {
        userLookCount[msg.sender]+=nums;
    }

    function login(string memory company) public {
        if(userConnectCount[msg.sender]==0)
            createUser(company);
        userConnectCount[msg.sender]++;
    }

    function findUsers(address add)public view returns(string memory company,uint look,uint connect){
        require(msg.sender==owner||msg.sender==add); //관리자만 가능하게
        uint id = userAddressToId[add];
        return (users[id].company,userLookCount[add],userConnectCount[add]);
    }
}
