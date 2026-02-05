---
title: Softmax 解析
date: 2026-02-05 12:00:00
---

这里才是正文...

# Softmax

Softmax 的名字里有一个 Max。它的初衷是想近似 max() 函数（选出最大的那个），但又要保持“软”的特性。

$$\text{softmax}(x_i) = \frac{e^{x_i}}{\sum e^{x_j}}$$

在注意力机制中，如果一个词和另一个词“有点相关”，我们往往希望模型忽略这种微弱的相关性，把注意力集中在“非常相关”的那个词上。指数函数能把这种“强者恒强”的特点发挥到极致，让背景噪声快速趋近于 0。

- 它是为了模拟 "Max"（马太效应）

- 求导极其完美 (Differentiable)

- 加法变乘法

- 这符合最大熵原理 (Maximum Entropy) 和物理学中的 玻尔兹曼分布 (Boltzmann Distribution)。