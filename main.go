package main

import (
	"fmt"
	"regexp"
)

func Getdomain(url string) (string, error) {
	// 定义正则表达式
	regexPattern := `(?:https?://)?(?:www\.)?([^/\r\n]+)`
	//`(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+)\.[a-zA-Z]{2,}`
	re := regexp.MustCompile(regexPattern)

	// 进行匹配
	match := re.FindStringSubmatch(url)
	if match == nil || len(match) < 2 {
		return "", fmt.Errorf("未能提取顶级域名")
	}

	return match[1], nil
}

func main() {
	url := "https://wiki.archlinuxcn.org/wiki/Fcitx"

	topLevelDomain, err := Getdomain(url)

	if err != nil {
		fmt.Println("错误:", err)
		return
	}

	fmt.Println("顶级域名:", topLevelDomain)
}
