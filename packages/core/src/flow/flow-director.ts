export interface FlowStep {
  readonly name: string;
  run(): void;
}

export class FlowDirector {
  private queued: FlowStep[] = [];
  private interrupts: FlowStep[] = [];

  push(step: FlowStep): void {
    this.queued.push(step);
  }

  interrupt(step: FlowStep): void {
    this.interrupts.push(step);
  }

  next(): FlowStep | undefined {
    return this.interrupts.shift() ?? this.queued.shift();
  }

  drain(): void {
    let step = this.next();
    while (step) {
      step.run();
      step = this.next();
    }
  }
}
