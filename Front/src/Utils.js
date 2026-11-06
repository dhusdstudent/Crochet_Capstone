let nextId = 1;

export function makeId(prefix) {
    return `${prefix}-${nextId++}`;
}