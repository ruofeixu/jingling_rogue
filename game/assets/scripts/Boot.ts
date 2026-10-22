import { _decorator, Component } from "cc";

const { ccclass } = _decorator;

@ccclass("Boot")
export class Boot extends Component {
  start(): void {
    console.log("jingling boot");
  }
}
