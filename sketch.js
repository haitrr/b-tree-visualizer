/* eslint-disable no-undef */
let tree;
let deleteInput;
let deleteButton;
let insertInput;
let insertButton;
let currentNode = null;
const delay = 1000;
let running = false;
// eslint-disable-next-line no-unused-vars
function setup() {
  tree = new BTree(2);
  let insertTo = 33;
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
  if(running) return;
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
  if(running) return;
  const value = parseInt(insertInput.value());
  if (!Number.isNaN(value)) {
    tree.insert(value);
    tree.verify();
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

    console.log('------------------');
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

  verify(min, max) {
    console.log('verifying');
    this.log();
    if (this.keys.length < this.degree - 1 || this.keys.length > this.degree * 2 - 1) {
      console.error('degree - 1 <= keys count < degree*2 - 1');
      return false;
    }

    if (
      (this.childs.length > 1 && this.childs.length < this.keys.length) ||
      this.childs.length - this.keys.length > 1
    ) {
      console.error('childs length are not valid');
      return false;
    }

    if (min && this.keys[0] < min) {
      console.error('key is smaller than min');
      return false;
    }

    if (max && this.keys[this.keys.length - 1] > max) {
      console.error('key is bigger than max');
      return false;
    }
    let current = this.keys[0];
    for (let i = 0; i < this.keys.length; i++) {
      if (this.keys[i] < current) {
        console.error('keys is not sorted');
        return false;
      }
      current = this.keys[i];
    }

    for (let i = 0; i < this.childs.length; i++) {
      if (!this.childs[i].verify(this.keys[i - 1] || min, this.keys[i] || max)) {
        return false;
      }
    }
    return true;
  }

  delete(value) {
    running = true;
    if (!this.verify()) {
      console.error('something went wrong');
      running = false;
      return;
    }
    currentNode = this;
    console.log('current node');
    console.log(`value ${value}`);
    this.log();
    if (this.keys.includes(value)) {
      console.log('current node contain value');
      const index = this.keys.findIndex((v) => v === value);
      if (this.childs.length === 0) {
        console.log('current node is leaf , delete value key');
        setTimeout(() => this.keys.splice(index, 1), delay);
        running = false;
        return;
      } else {
        console.log('current node is not leave.');
        const leftChild = this.childs[index];
        console.log('left child');
        leftChild.log();
        const rightChild = this.childs[index + 1];
        console.log('right child');
        rightChild.log();
        if (leftChild && leftChild.keys.length >= this.degree) {
          console.log('swap value to left child');
          this.keys[index] = leftChild.keys[leftChild.keys.length - 1];
          setTimeout(() => leftChild.delete(leftChild.keys[leftChild.keys.length - 1]), delay);
        } else if (rightChild.keys.length >= this.degree) {
          console.log('swap value to right child');
          this.keys[index] = rightChild.keys[0];
          setTimeout(() => rightChild.delete(rightChild.keys[0]), delay);
        } else {
          console.log('merge right child in to left child');
          leftChild.keys.push(value);
          rightChild.keys.forEach((key) => {
            leftChild.keys.push(key);
          });
          rightChild.childs.forEach((child) => {
            child.parent = leftChild;
            leftChild.childs.push(child);
          });
          this.keys.splice(index, 1);
          this.childs.splice(index + 1, 1);
          if (this.keys.length === 0) {
            this.childs = leftChild.childs;
            this.keys = leftChild.keys;
          }
          setTimeout(() => leftChild.delete(value), delay);
        }
      }
    } else {
      console.log('current node does not contain value');
      let i = 0;
      if (this.childs.length === 0) {
        console.log('value not found in the tree');
        running = false;
        return;
      }
      while (this.keys[i] < value) i += 1;
      const selectedChild = this.childs[i];
      console.log('selected child');
      selectedChild.log();
      if (selectedChild.keys.length === this.degree - 1) {
        console.log('selected child does not have enough keys');
        // index of selected child
        const thisIndex = i;

        // the left sibling
        console.log('left sibling');
        const leftSibling = this.childs[thisIndex - 1];
        leftSibling && leftSibling.log();

        // the right sibling
        console.log('right sibling');
        const rightSibling = this.childs[thisIndex + 1];
        rightSibling && rightSibling.log();

        if (leftSibling && leftSibling.keys.length >= this.degree) {
          console.log('move key from left sibling');
          selectedChild.keys.unshift(this.keys[thisIndex - 1]);
          this.keys[thisIndex - 1] = leftSibling.keys[leftSibling.keys.length - 1];
          leftSibling.keys.splice(leftSibling.keys.length - 1, 1);
          if (leftSibling.childs.length > 0) {
            const childToMove = leftSibling.childs[leftSibling.childs.length - 1];
            childToMove.parent = selectedChild;
            selectedChild.childs.unshift(childToMove);
            leftSibling.childs.splice(leftSibling.childs.length - 1, 1);
          }
        } else if (rightSibling && rightSibling.keys.length >= this.degree) {
          console.log('move key from right sibling');
          selectedChild.keys.push(this.keys[thisIndex]);
          this.keys[thisIndex] = rightSibling.keys[0];
          rightSibling.keys.splice(0, 1);
          if (rightSibling.childs.length > 0) {
            const childToMove = rightSibling.childs[0];
            childToMove.parent = selectedChild;
            selectedChild.childs.push(childToMove);
            rightSibling.childs.splice(0, 1);
          }
        } else {
          console.log('both left and right sibling does not have enough key');
          // move a key to child to become median
          if (rightSibling) {
            selectedChild.keys.push(this.keys[thisIndex]);
            this.keys.splice(thisIndex, 1);
          } else {
            selectedChild.keys.unshift(this.keys[thisIndex - 1]);
            this.keys.splice(thisIndex - 1, 1);
          }
          if (rightSibling) {
            console.log('merge right sibling');
            rightSibling.keys.forEach((key) => {
              selectedChild.keys.push(key);
            });
            this.childs.splice(thisIndex + 1, 1);
            rightSibling.childs.forEach((child) => {
              child.parent = selectedChild;
              selectedChild.childs.push(child);
            });
          } else if (leftSibling) {
            console.log('merge left sibling');
            for (let i = leftSibling.keys.length - 1; i > -1; i--) {
              selectedChild.keys.unshift(leftSibling.keys[i]);
            }

            this.childs.splice(thisIndex - 1, 1);
            for (let i = leftSibling.childs.length - 1; i > -1; i--) {
              leftSibling.childs[i].parent = selectedChild;
              selectedChild.childs.unshift(leftSibling.childs[i]);
            }
          }

          if (this.keys.length === 0) {
            console.log('this node have no keys left');
            console.log('make it the selected child');
            this.keys = selectedChild.keys;
            this.childs = selectedChild.childs;
            selectedChild.parent = null;
          }
        }
        setTimeout(() => selectedChild.delete(value), delay);
        console.log(' ******** End Step ****');
      } else {
        setTimeout(() => selectedChild.delete(value), delay);
        console.log(' ******** End Step ****');
      }

      if (!this.verify()) {
        console.error('something went wrong');
        return;
      }
      console.log(' ******** End Step ****');
    }
  }

  draw(x, y, size = 10, hsplit = 10, vsplit = 30) {
    this.keys.map((value, index) => {
      const valX = x + index * size;
      stroke(255);
      if (this === currentNode) {
        stroke('red');
      }
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
