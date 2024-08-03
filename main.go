package main

import (
	"encoding/hex"
	"fmt"

	"golang.org/x/crypto/blake2b"
)


func main() {
	b1,_ := hex.DecodeString("01")
	b := blake2b.Sum256(b1)
	fmt.Println(hex.EncodeToString(b[:]))
}