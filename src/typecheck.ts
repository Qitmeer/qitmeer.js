// Copyright 2017-2018 The meer developers
// Use of this source code is governed by an ISC
// license that can be found in the LICENSE file.

import types from "./types";

// 定义类型接口
type TypeFunction = (value: any) => boolean;

function getTypeName(fn: TypeFunction): string {
  return (
    fn.name || fn.toString().match(/function (.*?)\s*\(/)?.[1] || "unknown"
  );
}

function typecheck(type: TypeFunction, value: any): boolean {
  if (types.Function(type)) {
    if (type(value)) return true;
    const tname = getTypeName(type);
    throw new Error("check type " + tname + " failed, invalid value " + value);
  }
  throw new Error(
    "fail to execute type check: the first argument should be a type function"
  );
}

export default typecheck;
