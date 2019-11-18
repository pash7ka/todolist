const ToDoList = artifacts.require("ToDoList");

const { ZERO_ADDRESS } = require('./utils/constants');

contract('ToDoList', (admin, user1, user2) => {
    beforeEach(async () => {
        this.ToDoList = await ToDoList.new();
    });

    it('should create tasks', async () => {
        for(let i=0; i < 3; i++){
            let task = createRandomTaskDetails(user1);
            let receipt = await this.ToDoList.createTask(task.title, task.description, task.deadline, task.assigned);
            let taskId = receipt.logs.filter(e=>e.event=="TaskCreated").map(e=>e.args.id);
            let createdTask = await this.ToDoList.tasks(taskId);
            //console.log(taskId.toString());
            //console.log(createdTask)
            assert.equal(createdTask.title, task.title, "Title of created task does not match");
        }
    });
    it('should archive tasks', async () => {
        const archiveTaskNum = 2;
        let archiveTaskId;
        for(let i=0; i < 4; i++){
            let task = createRandomTaskDetails(user1);
            let receipt = await this.ToDoList.createTask(task.title, task.description, task.deadline, task.assigned);
            if(i == archiveTaskNum){
                archiveTaskId = receipt.logs.filter(e=>e.event=="TaskCreated").map(e=>e.args.id);
            }
        }
        await this.ToDoList.archiveTask(archiveTaskId);
        let resultTask = await this.ToDoList.tasks(archiveTaskId);
        assert.isTrue(resultTask.archive, "Task should be marked as archive")

    })

    it('should delete tasks', async () => {
        const deleteTaskNum = 2;
        let deleteTaskId;
        for(let i=0; i < 4; i++){
            let task = createRandomTaskDetails(user1);
            let receipt = await this.ToDoList.createTask(task.title, task.description, task.deadline, task.assigned);
            if(i == deleteTaskNum){
                deleteTaskId = receipt.logs.filter(e=>e.event=="TaskCreated").map(e=>e.args.id);
            }
            if(i == 0){
                deleteTaskId0 = receipt.logs.filter(e=>e.event=="TaskCreated").map(e=>e.args.id);
            }
        }
        await this.ToDoList.deleteTask(deleteTaskId);
        let resultTask = await this.ToDoList.tasks(deleteTaskId);
        //console.log(resultTask);
        assert.equal(resultTask.title, '', "Title of deleted task should be empty");

        let taskIds = await this.ToDoList.listAllTasks();
        //console.log(taskIds);
        taskIds = taskIds.map(id=>id.toNumber());
        expect(taskIds).to.not.include.members([Number(deleteTaskId.toString())]);

    })


    function createRandomTaskDetails(_assigned=ZERO_ADDRESS){
        return {
            title: "Task "+Math.ceil(Math.random()*1000),
            description: web3.utils.randomHex(60),
            deadline: Math.ceil(Date.now()/1000)+Math.round(6000 + Math.random()*10000),
            assigned: _assigned
        }
    }

});

/*
contract('ToDoList', (admin, user1, user2) => {
  it('should create task', async () => {

  });

  it('should put 10000 MetaCoin in the first account', async () => {
    const metaCoinInstance = await MetaCoin.deployed();
    const balance = await metaCoinInstance.getBalance.call(accounts[0]);

    assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
  });
  it('should call a function that depends on a linked library', async () => {
    const metaCoinInstance = await MetaCoin.deployed();
    const metaCoinBalance = (await metaCoinInstance.getBalance.call(accounts[0])).toNumber();
    const metaCoinEthBalance = (await metaCoinInstance.getBalanceInEth.call(accounts[0])).toNumber();

    assert.equal(metaCoinEthBalance, 2 * metaCoinBalance, 'Library function returned unexpected function, linkage may be broken');
  });
  it('should send coin correctly', async () => {
    const metaCoinInstance = await MetaCoin.deployed();

    // Setup 2 accounts.
    const accountOne = accounts[0];
    const accountTwo = accounts[1];

    // Get initial balances of first and second account.
    const accountOneStartingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
    const accountTwoStartingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();

    // Make transaction from first account to second.
    const amount = 10;
    await metaCoinInstance.sendCoin(accountTwo, amount, { from: accountOne });

    // Get balances of first and second account after the transactions.
    const accountOneEndingBalance = (await metaCoinInstance.getBalance.call(accountOne)).toNumber();
    const accountTwoEndingBalance = (await metaCoinInstance.getBalance.call(accountTwo)).toNumber();


    assert.equal(accountOneEndingBalance, accountOneStartingBalance - amount, "Amount wasn't correctly taken from the sender");
    assert.equal(accountTwoEndingBalance, accountTwoStartingBalance + amount, "Amount wasn't correctly sent to the receiver");
  });
});
*/