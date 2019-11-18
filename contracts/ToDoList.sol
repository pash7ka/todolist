pragma solidity ^0.5.0;

import "@openzeppelin/contracts/GSN/Context.sol";
import "./AdminRole.sol";

/**
 * @title A simple ToDo List
 * @author pash7ka
 */
contract ToDoList is Context, AdminRole  {

	event TaskCreated(uint256 id, string title, uint64 deadline, address assigned);
	event TaskArchived(uint256 id);
	event TaskDeleted(uint256 id);

	struct Task {
		string title;
		string description;
		uint64 deadline;
		address assigned;
		bool done;
		bool archive;
	}

	Task[] public tasks;

	/**
	 * @notice Create task
	 * @param _title Title of the task. Title can not be empty.
	 * @param _description Detailed description of the task.
	 * @param _deadline Unix timestamp of the task deadline. Zero means no deadline.
	 * @param _assigned Address of the person assigned to the task
	 */
	function createTask(string calldata _title, string calldata _description, uint64 _deadline, address _assigned) onlyAdmin external returns(uint256) {
		require(bytes(_title).length > 0, "ToDoList: Title can not be empty");
		tasks.push(Task({
			title: _title,
			description: _description,
			deadline: _deadline,
			assigned: _assigned,
			done: false,
			archive: false
		}));
		uint256 taskId = tasks.length-1;
		emit TaskCreated(taskId, _title, _deadline, _assigned);
		return taskId;
	}
	/**
	 * @notice Mark task as archived
	 * @param taskId Idof the task
	 */
	function archiveTask(uint256 taskId) onlyAdmin external {
		tasks[taskId].archive = true;
		emit TaskArchived(taskId);
	}

	/**
	 * @notice Delete task
	 * @param taskId Idof the task
	 */
	function deleteTask(uint256 taskId) onlyAdmin external {
		delete tasks[taskId]; //This makes all fields of the struct empty
		emit TaskDeleted(taskId);
	}


	/**
	 * @notice Returns array of ids of all not-deleted tasks
	 */
	function listAllTasks() view public returns(uint256[] memory) {
		return filterTasks(true, true, address(0));
	}
	/**
	 * @notice Returns array of ids of all pending tasks for an address
	 * @param assigned Address to filter tasks
	 */
	function listPendingTasks(address assigned) view public returns(uint256[] memory) {
		return filterTasks(false, false, assigned);
	}


	/**
	 * @notice Filters tasks list 
	 * @param includeArchive Include archive tasks
	 * @param includeDone Include done tasks
	 * @param assigned If not zero, only include tasks assigned to this address
	 */
	function filterTasks(bool includeArchive, bool includeDone, address assigned) view internal returns(uint256[] memory){
		uint256[] memory taskIds = new uint256[](tasks.length);
		uint256 count = 0;
		for(uint256 i=0; i < tasks.length; i++){
			Task storage t = tasks[i];
			if(bytes(t.title).length == 0) continue;						//Deleted task
			if(!includeArchive && t.archive) continue;						//Archive task
			if(!includeDone && t.done) continue;							//Done task
			if(assigned != address(0) && assigned != t.assigned) continue;	//Assigned to another address
			//Add task to result
			taskIds[count] = i;
			count++;
		}
		//Copy array to an array with correct length
		uint256[] memory result = new uint256[](count);
		for(uint256 i=0; i< count; i++){
			result[i] = taskIds[i];
		}
		return result;
	}


}