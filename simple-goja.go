package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"

	"github.com/dop251/goja"
)

func HS256(text string, secret string) string {
	fmt.Println(`HS256`, text, fmt.Sprintf("%x", secret))
	// Try to decode hex string if possible
	if decoded, err := hex.DecodeString(secret); err == nil {
		secret = string(decoded)
	}
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(text))
	return fmt.Sprintf("%x", h.Sum(nil))
}

func main() {
	vm := goja.New()

	// Create console object with log method
	console := vm.NewObject()
	err := console.Set("log", func(call goja.FunctionCall) goja.Value {
		args := make([]interface{}, len(call.Arguments))
		for i, arg := range call.Arguments {
			args[i] = arg.String()
		}
		fmt.Println(args...)
		return nil
	})
	if err != nil {
		panic(err)
	}

	// Set console object in global scope
	err = vm.Set("console", console)
	if err != nil {
		panic(err)
	}

	// Bind the HS256 function to the JavaScript runtime
	err = vm.Set("HS256", HS256)
	if err != nil {
		panic(err)
	}

	// Test the function from JavaScript with double HMAC
	_, err = vm.RunString(`
		// First HMAC
		const firstSignature = HS256("first-value", "secret");
		console.log("First signature:", firstSignature);

		// Second HMAC using first signature as key
		const secondSignature = HS256("second-value", firstSignature.match(/.{2}/g).map(v => String.fromCharCode(parseInt(v, 16))));
		console.log("Second signature:", secondSignature);
	`)
	if err != nil {
		panic(err)
	}
}
