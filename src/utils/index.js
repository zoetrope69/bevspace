export function binarySearch(arr, id) {
  let low = 0, high = arr.length, mid;

  while (low < high) {
    mid = Math.floor((low + high) / 2);
    if (arr[mid]._id < id) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}
