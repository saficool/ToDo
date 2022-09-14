import { Component, OnInit } from '@angular/core';
import { ethers } from 'ethers';
const ToDo = require("src/artifacts/contracts/ToDo.sol/ToDo.json");

declare let window: any
let toDoContractAddress = "0x0695d32c796d7cd76d1D5F4c780deD72B7eF070e";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ToDo';
  public connectedAccountAddress: string = '';
  allTasks: any[] = [];

  constructor() { }

  ngOnInit(): void {
    // if (typeof window.ethereum === 'undefined') {
    //   this.requestAccount();
    // }
    this.requestAccount();
  }

  async requestAccount() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    this.connectedAccountAddress = accounts[0];
    await this.getAllTask();
  }

  async addTask(task: string) {
    console.log(task)
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(toDoContractAddress, ToDo.abi, signer)
      const transaction = await contract['addTask'](task);
      await transaction.wait(1);
      console.log("added")
      await this.getAllTask();
    }
  }

  async getTask() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(toDoContractAddress, ToDo.abi, signer);
      try {
        const data = await contract['getTask'](0);
        console.log(data);
      }
      catch (err) {
        console.log(err)
      }
    }
  }

  async getAllTask() {
    this.allTasks = []
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(toDoContractAddress, ToDo.abi, signer);
      try {
        const data = await contract['getAllTask']();
        data.forEach((element: any) => {
          this.allTasks.push({
            task: element[0],
            isDone: element[1]
          })
        });
        console.log(this.allTasks)
      }
      catch (err) {
        console.log(err)
      }
    }
  }

  async deleteTask(_taskIndex: number) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(toDoContractAddress, ToDo.abi, signer);
    try {
      const transactionResponse = await contract['deleteTask'](_taskIndex);
      await transactionResponse.wait(1);
      this.allTasks.splice(_taskIndex, 1)
      console.log(`Task deleted at index ${_taskIndex}`);
    }
    catch (err) {
      console.log(err)
    }
  }

  onCheckboxChange(event: any, _taskIndex: number) {
    this.updateStatus(_taskIndex, event.target.checked);
  }


  async updateStatus(_taskIndex: number, _isDone: boolean) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(toDoContractAddress, ToDo.abi, signer);
    try {
      const transactionResponse = await contract['updateStatus'](_taskIndex, _isDone);
      await transactionResponse.wait(1);
      console.log(`Task updated at index ${_taskIndex}`);
      this.getAllTask()
    }
    catch (err) {
      console.log(err)
    }
  }

}
