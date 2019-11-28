/* eslint-disable no-undef */
let tree;
let deleteInput;
let deleteButton;
let insertInput;
let insertButton;
// eslint-disable-next-line no-unused-vars
function setup() {
  tree = new BTree(2);
  let insertTo = 37;
  for (let i = 0; i < insertTo; i++) {
    tree.insert(Math.floor(Math.random() * 100));
  }

  createCanvas(windowWidth, windowHeight);
  background(0);
  textAlign(CENTER, CENTER);
  insertInput = createInput();
  insertInput.position(20, 20);
  insertInput.size(100);
  insertButton = createButton('Insert');
  insertButton.position(140, 20);
  insertButton.size(50);
  insertButton.mousePressed(insertButtonPressed);
  createDeleteInput();
  createDeleteButton();
}

function createDeleteInput() {
  deleteInput = createInput();
  deleteInput.position(200, 20);
  deleteInput.size(100);
}

function createDeleteButton() {
  deleteButton = createButton('Delete');
  deleteButton.size(50);
  deleteButton.position(320, 20);
  deleteButton.mousePressed(deleteButtonPressed);
}

function deleteButtonPressed() {
  const value = parseInt(deleteInput.value());
  if (!Number.isNaN(value)) {
    tree.delete(value);
  }
}

// eslint-disable-next-line no-unused-vars
function draw() {
  background(0);
  stroke(255);
  text('B Tree visualizer', Math.floor(windowWidth / 2), 10);
  tree.draw(50, 50, 20);
}

const insertButtonPressed = () => {
  const value = parseInt(insertInput.value());
  if (!Number.isNaN(value)) {
    tree.insert(value);
  }
};

class BTree {
  constructor(degree, parent) {
    this.degree = degree;
    this.parent = parent;
    this.keys = [];
    this.childs = [];
  }

  log() {
    console.log(
      JSON.stringify(
        this,
        function(key, val) {
          if (key !== 'parent') return val;
        },
        2,
      ),
    );
  }

  split() {
    if (this.keys.length !== this.degree * 2 - 1) {
      return;
    }
    const medianIndex = this.degree - 1;
    const leftChild = new BTree(this.degree, this);
    const rightChild = new BTree(this.degree, this);
    this.childs.forEach((child, index) => {
      if (index <= medianIndex) {
        child.parent = leftChild;
        leftChild.childs.push(child);
      } else {
        child.parent = rightChild;
        rightChild.childs.push(child);
      }
    });

    this.keys.forEach((key, index) => {
      if (index < medianIndex) {
        leftChild.keys.push(key);
      } else if (index > medianIndex) {
        rightChild.keys.push(key);
      }
    });

    const medianKey = this.keys[medianIndex];
    const parent = this.parent;
    if (!parent) {
      this.keys = [medianKey];
      this.childs = [leftChild, rightChild];
    } else {
      rightChild.parent = parent;
      leftChild.parent = parent;
      const childIndex = parent.childs.findIndex((c) => c == this);
      this.parent.childs[childIndex] = leftChild;
      this.parent.childs.splice(childIndex + 1, 0, rightChild);
      let i;
      for (i = 0; i < parent.keys.length; i++) {
        if (parent.keys[i] >= medianKey) {
          break;
        }
      }
      this.parent.keys.splice(i, 0, medianKey);

      // if (parent.keys.length === this.degree * 2 - 1) {
      //   parent.split();
      // }
    }
    return { medianKey, leftChild, rightChild };
  }

  insert(value) {
    if (this.keys.length === this.degree * 2 - 1) {
      const { medianKey, rightChild, leftChild } = this.split();
      if (value > medianKey) {
        rightChild.insert(value);
      } else {
        leftChild.insert(value);
      }
    } else {
      let i = 0;
      while (value > this.keys[i] && i < this.keys.length) {
        i += 1;
      }
      if (this.childs[i]) {
        this.childs[i].insert(value);
      } else {
        this.keys.push(value);
        this.keys.sort(function(a, b) {
          return a - b;
        });
      }
    }
  }

  delete(value) {
    if (this.keys.includes(value)) {
      console.log(this)
      const index = this.keys.findIndex((v) => v === value);
      if (!this.childs) {
        this.keys.splice(index, 1);
      } else {
        const leftChild = this.childs[index];
        const rightChild = this.childs[index + 1];
        if (leftChild.keys.length >= this.degree) {
          this.keys[index] = leftChild.keys[0];
          leftChild.delete(leftChild.keys[0]);
        } else if (rightChild.keys.length >= this.degree) {
          this.keys[index] = rightChild.keys[0];
          rightChild.delete(rightChild.keys[0]);
        }
      }
    } else {
      let i = 0;
      while (this.keys[i] < value) i += 1;
      const selectedChild = this.childs[i];
      if (selectedChild.keys.length === this.degree - 1) {
        const parent = this.parent
        const thisIndex = parent.childs.findIndex(c => c=== this)
        const leftSibling = parent.childs[thisIndex - 1]
        const rightSibling = parent.childs[thisIndex + 1]
        // todo: continue
      } else {
        selectedChild.delete(value);
      }
    }
  }

  draw(x, y, size = 10, hsplit = 10, vsplit = 30) {
    this.keys.map((value, index) => {
      const valX = x + index * size;
      stroke(255);
      square(valX, y, size);
      stroke(0);
      text(value, valX + size / 2, y + size / 2);
    });

    let currentX = x + size * this.keys.length + hsplit;
    this.childs.map((child, index) => {
      stroke(255);
      line(x + size * index, y + size, currentX, y + size + vsplit);
      currentX = child.draw(currentX, y + size + vsplit, size, hsplit, vsplit);
    });

    return currentX;
  }
}
