package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

func main() {
	foo := hmac.New(sha256.New, []byte("secret"))
	foo.Write([]byte("first-value"))
	fooDigest := foo.Sum(nil)

	// Convert []byte to hex string using Sprintf
	fooHex := fmt.Sprintf("%x", fooDigest)
	fmt.Printf("foo hex: %s\n", fooHex)

	// Convert hex string back to []byte
	fooBytes, err := hex.DecodeString(fooHex)
	if err != nil {
		panic(err)
	}

	// Use the converted bytes
	bar := hmac.New(sha256.New, fooBytes)
	bar.Write([]byte("second-value"))
	barDigest := bar.Sum(nil)
	fmt.Printf("bar: %x\n", barDigest)
}
