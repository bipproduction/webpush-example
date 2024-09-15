import { Subscription } from "@/types/Subs";

export class Sub {
  static value: Subscription | null = null;

  static set(value: Subscription | null) {
    this.value = value;
  }

  static get() {
    return this.value;
  }
}
