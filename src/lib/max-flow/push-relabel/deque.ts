const customInspectSymbol = Symbol.for("nodejs.util.inspect.custom");

export class Deque<T> {
  private list: T[] = [];

  constructor(list: T[] = []) {
    this.list = list;
  }

  isEmpty() {
    return !Boolean(this.list.length);
  }

  append(item: T) {
    this.list.push(item);
  }

  popLeft() {
    if (!this.isEmpty()) {
      return this.list.shift() as T;
    }

    return undefined;
  }

  includes(item: T) {
    const [firstElement] = this.list;
    if (
      Array.isArray(firstElement) ||
      typeof firstElement === "object" ||
      typeof firstElement === "function" ||
      typeof firstElement === "bigint" ||
      typeof firstElement === "symbol" ||
      typeof firstElement === "undefined"
    ) {
      return false;
    }

    return this.list.includes(item);
  }

  toString() {
    return "deque([" + this.list.join(", ") + "])";
  }

  [customInspectSymbol]() {
    return "deque([" + this.list.join(", ") + "])";
  }
}
