/* eslint-disable no-undef */
let tree;
let deleteInput;
let deleteButton;
let insertInput;
let insertButton;
// eslint-disable-next-line no-unused-vars
function setup() {
  tree = new BTree(2);
  let insertTo = 30;
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
    this.values = [];
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

  divide(left, right, middle, child) {
    let i = 0;
    while (middle > this.values[i] && i < this.values.length) {
      i += 1;
    }
    this.values.splice(i, 0, middle);
    left.parent = this;
    right.parent = this;
    this.childs[this.childs.findIndex((c) => c === child)] = left;
    this.childs.splice(i + 1, 0, right);
    if (this.values.length === this.degree * 2) {
      let left = new BTree(this.degree, this);
      let right = new BTree(this.degree, this);
      let middle = Math.floor(this.degree / 2);
      for (i = 0; i < this.values.length; i++) {
        if (i < middle) {
          left.values.push(this.values[i]);
          this.childs[i].parent = left;
          left.childs.push(this.childs[i]);
        }

        if (i === middle) {
          this.childs[i].parent = left;
          left.childs.push(this.childs[i]);
        }

        if (i > middle) {
          right.values.push(this.values[i]);
          right.childs.push(this.childs[i]);
          this.childs[i].parent = right;
        }
      }
      right.childs.push(this.childs[i]);
      this.childs[i].parent = right;
      middle = this.values[middle];
      if (this.parent) {
        this.parent.divide(left, right, middle, this);
      } else {
        right.parent = this;
        left.parent = this;
        this.values = [middle];
        this.childs = [left, right];
      }
    }
  }

  insert(value) {
    let i = 0;
    while (value > this.values[i] && i < this.values.length) {
      i += 1;
    }

    if (this.childs[i]) {
      this.childs[i].insert(value);
    } else {
      this.values.push(value);
      this.values.sort(function(a, b) {
        return a - b;
      });

      if (this.values.length === this.degree * 2) {
        let left = new BTree(this.degree, this);
        let right = new BTree(this.degree, this);
        let middle = Math.floor(this.degree / 2);
        for (i = 0; i < this.values.length; i++) {
          if (i < middle) {
            left.insert(this.values[i]);
          }

          if (i > middle) {
            right.insert(this.values[i]);
          }
        }
        middle = this.values[middle];
        if (this.parent) {
          this.parent.divide(left, right, middle, this);
        } else {
          this.values = [middle];
          this.childs = [left, right];
        }
      }
    }
  }

  delete(value) {
    if(!this.values.includes(value)) {
      for(let i =0; i< this.childs.length;i++) {
        if(this.childs[i].delete(value)) break;
      }
    }

    var index = this.values.findIndex(v => v === value);
    // leave node
    if(this.childs.length === 0)  {
      // delete the value from node if have enought keys.
      if(this.values.length >= this.degree) {
        this.values.splice(index, 1)
        return true;
      }
      else {
        // find the imediate sibling that have more than degree keys
        const parent = this.parent
        const index = parent.childs.findIndex(v => v=== this)
        const leftChild = parent.childs[index-1]
        const rightChild = parent.childs[index+1]
        // TODO: continue
      }
    }


    // internal node
    if(this.values.length === this.degree - 1) {
      // TODO: continue
    }

    const leftChild = this.childs[index]
    const rightChild = this.childs[index+1]
    if(leftChild.values.length >= this.degree) {
      leftChild.delete(leftChild.values[0])
      this.values[index] = leftChild.values[0]
    }
    else 
      if(rightChild.values.length >= this.degree) {
      rightChild.delete(rightChild.values[0])
      this.values[index] = rightChild.values[0]
      return true;
    }
    else {
      // merge value and right to left
      leftChild.values = [...leftChild.values, value, rightChild.values ]

      // remove value at current node
      this.values.splice(index, 1)
      // remove right child at current node
      this.childs.splice(index+1, 1)
      return leftChild.delete(value)
    }

  }

  draw(x, y, size = 10, hsplit = 10, vsplit = 30) {
    this.values.map((value, index) => {
      const valX = x + index * size;
      stroke(255);
      square(valX, y, size);
      stroke(0);
      text(value, valX + size / 2, y + size / 2);
    });

    let currentX = x + size * this.values.length + hsplit;
    this.childs.map((child, index) => {
      stroke(255);
      line(x + size * index, y + size, currentX, y + size + vsplit);
      currentX = child.draw(currentX, y + size + vsplit, size, hsplit, vsplit);
    });

    return currentX;
  }
}
