pragma solidity ^0.5.1;

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

    mapping(uint => address) public userToIdAddress; //유저 id에 address mapping
    mapping(address => uint) public userLookCount; //주소별 열람 횟수 mapping
    mapping(address => uint) public userConnectCount;

    constructor()public{
        owner = msg.sender;
        _createManager();
    }

    //관리자 생성
    function _createManager() private {
        require(msg.sender==owner);
        uint id = users.push(User("manager"))-1; //id값 부여
        userToIdAddress[id] = msg.sender; //id값에 유저 address mapping
        userConnectCount[msg.sender]++;
    }

    //유저 생성 => 이름, 번호 입력
    function createUser(string memory company) public {
        require(userConnectCount[msg.sender]==0);
        uint id = users.push(User(company))-1; //id값 부여
        userToIdAddress[id] = msg.sender; //id값에 유저 address mapping
        emit NewUser(id,company); //이벤트 발생(프론트 전달)
        userConnectCount[msg.sender]++;
    }

    function login()public{
        require(userConnectCount[msg.sender]!=0);
        userConnectCount[msg.sender]++;
    }

    function findUsers(uint id)public view returns(string memory,uint,uint){
        require(msg.sender==owner); //관리자만 가능하게
        address add = userToIdAddress[id];
        return (users[id].company,userLookCount[add],userConnectCount[add]);
    }

    // //contract에 예치금 전송
    function deposit() public payable {
        require(msg.sender==owner); //contract에 예치금 전송
    }

    // //user의 잔고 확인
    function getBalance()public view returns(uint){
        // require(msg.sender==owner); //owner와 sender가 같을때
        return address(this).balance; //owner의 잔고 반환
    }

    function pay()public returns(uint){
        msg.sender.transfer(getBalance()-userLookCount[msg.sender]*1000000000000000000);
    }

    //데이터 열람
    function reading() public{
        userLookCount[msg.sender]++; //열람 카운트+1
    }
}