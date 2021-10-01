/*
mono.js
copyright 2020 @Messiz Qin https://github.com/messizqin

* manipulate data by monotonicity

<Poly>
    support changing additional lists based on how initial list is changed

<Mono>
    extract the largest sample of data based on passed in operator, for example, mono-increasing when operator is <

Notice the purpose of this module, is to extract based on iterating sequence, to be specific
[0, 1, -5, 3, -2, 6]
if we set operate to <,
the first branch will be [0, 1, 3, 6]
second branch will be [-5, 2, 6]
the longest branch will be returned, in this case [0, 1, 3, 6]
*/

class Poly{
  static mirror(original, changed, to_change){
    return changed.map(ii=>to_change[original.indexOf(ii)]);
  }

  constructor(array, along){
    this.array = array.map(ar=>ar);
    if(along == null){
      this.along = null;
    }else if(along[0].constructor === Array){
      this.along = along.map(arr=>arr.map(ar=>ar));
    }else{
      this.along = along.map(ar=>ar);
    }
    this.publish = this.publish.bind(this);
  }

  publish(ca){
    let res = {array: ca};
    if(this.along == null){}else if(this.along[0].constructor === Array){
      res.along = this.along.map(al=>Poly.mirror(this.array, ca, al));
    }else{
      res.along = Poly.mirror(this.array, ca, this.along);
    }
    return res;
  }
}

class Mono extends Poly{
  /* 
  Monotonicity Branch Algorithm
  Aim
    select the longest branch from data within certain mono feature
      Take mono-increase as an example
      for a list of data, iterate it, separate at current. for the
      first half, check if any of the previous has any that is less than
      the current item, if condition satisfied, which indicates previous
      branches can be appended, there's no need to restart a new branch.
      if condition fails, then check if any of the next half is
      greater than current value, if so, then we need to prepare
      a new branch for future, therefore append the item within a
      new list to branches.
  */

  // get the longest array out of a list of arrays
  static longest(arr){
    let lengths = Array.from(arr, ar=>ar.length);
    try{
      return arr[lengths.indexOf(Math.max(...lengths))];
    }catch(e){
      throw new Error('There is not enough data for monotonicity');
    }
  }

  // only return true of any of the array is less than arg
  static compare(array, arg, func){
    for(let ii = 0; ii < array.length; ii++){
      if(func(array[ii], arg)){
        return true;
      }
    }
    return false
  }

  /*
  following are not magic methods
  since they are used as callbacks associated by operator param in Mono initializer 
  */

  static gt(arg1, arg2){return arg1 > arg2}
  static ge(arg1, arg2){return arg1 >= arg2}
  static lt(arg1, arg2){return arg1 < arg2}
  static le(arg1, arg2){return arg1 <= arg2}

  static strict_increasing(arr){
    for(let ii = 0; ii < arr.length - 1; ii++){
      if(Mono.ge(arr[ii], arr[ii + 1])){
        return false
      }
    }
    return true;
  }

  static strict_increasing_equal(arr){
    for(let ii = 0; ii < arr.length - 1; ii++){
      if(Mono.gt(arr[ii], arr[ii + 1])){
        return false
      }
    }
    return true;
  }

  static strict_decreasing(arr){
    for(let ii = 0; ii < arr.length - 1; ii++){
      if(Mono.lt(arr[ii], arr[ii + 1])){
        return false
      }
    }
    return true;
  }

  static strict_decreasing_equal(arr){
    for(let ii = 0; ii < arr.length - 1; ii++){
      if(Mono.le(arr[ii], arr[ii + 1])){
        return false
      }
    }
    return true;
  }

  // return mono increasing
  static branch(sign, arr, fir, sec){
    switch(sign){
      case '<':
        if(Mono.strict_increasing(arr)){
          return arr;
        }
      break;

      case '<=':
        if(Mono.strict_increasing_equal(arr)){
          return arr;
        }
      break;

      case '>':
        if(Mono.strict_decreasing(arr)){
          return arr;
        }
      break;

      case '>=':
        if(Mono.strict_decreasing_equal(arr)){
          return arr;
        }
      break;
    }

    let branches = [];
    for(let ii = 0; ii < arr.length; ii++){
      let dd = arr[ii];
      if(Mono.compare(arr.slice(0, ii), dd, fir)){
        for(let jj = 0; jj < branches.length; jj++){
          let bran = branches[jj];
          // if the branch last item is less than current, then append
          if(fir(bran[bran.length - 1], dd)){
            bran.push(dd);
          }else{
            for(let pp = 0; pp < bran.length; pp++){
              // count from last to first
              let oo = bran.length - 1 - pp;
              // once target is find, kill the loop
              if(fir(bran[oo], dd)){
                let bra = bran.slice(0, oo);
                bra.push(dd);
                branches.push(bra);
                break;
              }
            }
          }
        }
      }else if(Mono.compare(arr.slice(ii), dd, sec)){
        // add branch
        branches.push([dd]);
      }
    }
    return Mono.longest(branches);
  }

  static operation(sign){
    switch(sign){
      case '<':
        return [Mono.lt, Mono.gt]
      break;
      case '>':
        return [Mono.gt, Mono.lt]
      break;
      case '<=':
        return [Mono.le, Mono.ge]
      break;
      case '>=':
        return [Mono.ge, Mono.le]
      break;
    }
  }

  constructor(array, operate, along){
    super(array, along);
    this.opt = Mono.operation(operate.trim());
    this.sign = operate;
  }

  set operate(value){
    this.opt = Mono.operation(value.trim());
    this.sign = operate;
  }

  get mono(){
    return this.publish(Mono.branch(this.sign, this.array, ...this.opt));
  }
}

let cols = [0, -100, -1000, 0, 1, 1, 2, -100, 3, -200, -200, -300, -1000, -12000];
let brr = Array.from(cols, (ii, dd)=>dd);

// m = new Mono(cols, '>', brr);
// console.log(m.mono);
console.log(new Mono([0, 15], '>').mono);

