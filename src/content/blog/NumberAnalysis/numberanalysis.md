---
title: 'Number Analysis'
description: 'A curricular review.'
publishDate: '2026-05-12 19:01:00'
tags:
  - Math
---


# 数值分析复习总结

## 多元函数误差传播公式

$$\varepsilon(z) \leq \left|\frac{\partial z}{\partial x}\right|\varepsilon(x) + \left|\frac{\partial z}{\partial y}\right|\varepsilon(y)$$

### 例题

> 设 $x = 1.025$，$y = 2.301$ 均具有 4 位有效数字，给定函数
> $$z = e^{xy} + \sin\!\left(2xy^2 + 3\frac{x}{y}\right)$$
> 试分析计算 $z$ 的绝对误差限、相对误差限以及有效数字位数。

#### 第一步：确定 x, y 的误差限

4 位有效数字的误差限为末位的半个单位：

$$\varepsilon(x) = 0.0005, \quad \varepsilon(y) = 0.0005$$

#### 第二步：计算各中间量的值

$$xy = 1.025 \times 2.301 = 2.35853$$

$$xy^2 = xy \cdot y = 2.35853 \times 2.301 = 5.42607$$

$$\frac{x}{y} = \frac{1.025}{2.301} = 0.44546$$

$$2xy^2 + 3\frac{x}{y} = 2 \times 5.42607 + 3 \times 0.44546 = 10.85214 + 1.33638 = 12.18852$$

$$z = e^{2.35853} + \sin(12.18852)$$

$$e^{2.35853} \approx 10.5737, \quad \sin(12.18852) \approx -0.4941$$

$$z \approx 10.5737 + (-0.4941) = 10.0796$$

#### 第三步：用误差传播公式求绝对误差限

令 $u = xy$，$v = 2xy^2 + 3\dfrac{x}{y}$，$z = e^u + \sin v$，则：

$$\frac{\partial z}{\partial x} = e^{xy} \cdot y + \cos(v)\left(2y^2 + \frac{3}{y}\right)$$

$$\frac{\partial z}{\partial y} = e^{xy} \cdot x + \cos(v)\left(4xy - \frac{3x}{y^2}\right)$$

已知 $e^{xy} = 10.5737$，$\cos(12.18852) \approx 0.8693$：

$$\frac{\partial z}{\partial x} = 10.5737 \times 2.301 + 0.8693 \times \left(2 \times 2.301^2 + \frac{3}{2.301}\right) = 24.330 + 0.8693 \times 11.893 = 34.667$$

$$\frac{\partial z}{\partial y} = 10.5737 \times 1.025 + 0.8693 \times \left(4 \times 1.025 \times 2.301 - \frac{3 \times 1.025}{2.301^2}\right) = 10.838 + 0.8693 \times 8.850 = 18.531$$

**绝对误差限**：

$$\varepsilon(z) = 34.667 \times 0.0005 + 18.531 \times 0.0005 = 0.01733 + 0.00927 = \boxed{0.0266}$$

#### 第四步：相对误差限

$$\varepsilon_r(z) = \frac{\varepsilon(z)}{|z|} = \frac{0.0266}{10.0796} \approx \boxed{0.264\%}$$

#### 第五步：有效数字位数

由 $\varepsilon_r \approx 0.264\%$，有效数字位数 $n$ 满足：

$$\frac{1}{2} \times 10^{1-n} \geq \varepsilon(z) = 0.0266 \implies 10^{1-n} \geq 0.0532 \implies 1-n \geq -1.274 \implies n \leq 2.274$$

$$\boxed{z \approx 10.08 \text{ 具有 4 位有效数字}}$$

---

## Horner 算法（嵌套乘法）

### 核心思想

Horner 算法通过**嵌套乘法**（重新括号化）消除多项式求值中的重复计算，显著减少乘法次数。

### 简单例子对比

**普通写法**（直接计算）：

$$f(x) = 5x^4 + 3x^3 + 2x^2 + 4x + 1$$

逐项计算，需要 **10 次乘法**。

**Horner 改写**（层层提取 $x$）：

$$f(x) = ((((5)x + 3)x + 2)x + 4)x + 1$$

从最内层括号开始计算，只需 **4 次乘法 + 4 次加法**。

### 算法步骤（$n$ 次多项式）

对于多项式 $f(x) = a_n x^n + a_{n-1} x^{n-1} + \cdots + a_1 x + a_0$，在 $x = x_0$ 处的递推公式：

$$\begin{cases} b_n = a_n \\ b_k = a_k + b_{k+1} \cdot x_0, \quad k = n-1, n-2, \ldots, 0 \end{cases}$$

最终 $b_0 = f(x_0)$。

---

## 非线性方程数值解

### 1. 二分法

每次二分后区间长度减半，第 $n$ 次迭代后的误差满足：

$$|x_n - x^*| \leq \frac{b-a}{2^n}$$

其中 $[a, b]$ 为初始区间，$x^*$ 为精确根，$x_n$ 为第 $n$ 次迭代的近似根。

#### 例程

求方程：

$$f(x)=x^3-x-2=0$$

在区间 $[1,2]$ 内的一个近似根。

因为：

$$f(1)=-2<0,\qquad f(2)=4>0$$

所以该区间内至少存在一个实根。

| 迭代次数 | 区间 | 中点 $x_n$ | $f(x_n)$ |
|---|---|---|---|
| 1 | $[1,2]$ | 1.5 | -0.125 |
| 2 | $[1.5,2]$ | 1.75 | 1.609 |
| 3 | $[1.5,1.75]$ | 1.625 | 0.666 |
| 4 | $[1.5,1.625]$ | 1.5625 | 0.252 |
| 5 | $[1.5,1.5625]$ | 1.53125 | 0.059 |

最终得到近似根：

$$x \approx 1.52$$

---

### 2. 不动点迭代

$$x_{n+1} = \varphi(x_n)$$

**收敛条件**：

$\forall x \in [a,b], |\varphi(x)| \in [a,b] $

$\forall x \in [a,b], |\varphi'(x)| < 1$

#### 例程

求解方程：

$$x^3+x-1=0$$

将方程化为：

$$x=\frac{1}{1+x^2}$$

构造迭代函数：

$$\varphi(x)=\frac{1}{1+x^2}$$

取初值：

$$x_0=0.5$$

迭代过程：

| $n$ | $x_n$ |
|---|---|
| 0 | 0.5000 |
| 1 | 0.8000 |
| 2 | 0.6098 |
| 3 | 0.7280 |
| 4 | 0.6537 |
| 5 | 0.7006 |

逐步收敛到方程的实根：

$$x \approx 0.682$$

---

### 3. 牛顿法（切线法）

在当前点 $x_n$ 处作函数 $f(x)$ 的切线，用切线与 $x$ 轴的交点作为下一个近似根：

$$\boxed{x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}}$$

**几何意义**：用切线近似曲线，将非线性方程的求根问题转化为线性方程求解。  
**收敛阶**：通常为**二阶收敛**（平方收敛）。

#### 例程

求方程：

$$x^2-2=0$$

即求：

$$\sqrt{2}$$

设：

$$f(x)=x^2-2,\qquad f'(x)=2x$$

牛顿迭代公式：

$$x_{n+1}=x_n-\frac{x_n^2-2}{2x_n}$$

取初值：

$$x_0=1.5$$

迭代过程：

| $n$ | $x_n$ |
|---|---|
| 0 | 1.500000 |
| 1 | 1.416667 |
| 2 | 1.414216 |
| 3 | 1.414214 |

因此：

$$\sqrt{2}\approx1.414214$$

---

### 4. 割线法（牛顿法的变体）

当 $f'(x)$ 难以计算时，用**差商**近似代替导数：

$$\boxed{x_{n+1} = x_n - \frac{f(x_n)(x_n - x_{n-1})}{f(x_n) - f(x_{n-1})}}$$

#### 例程

求方程：

$$x^3-x-2=0$$

取初值：

$$x_0=1,\qquad x_1=2$$

对应函数值：

$$f(1)=-2,\qquad f(2)=4$$

迭代过程：

| $n$ | $x_n$ |
|---|---|
| 0 | 1.000000 |
| 1 | 2.000000 |
| 2 | 1.333333 |
| 3 | 1.462687 |
| 4 | 1.531169 |
| 5 | 1.521376 |

最终得到近似根：

$$x \approx 1.521$$

---

## 矩阵范数

设 $A = (a_{ij}) \in \mathbb{R}^{m \times n}$：

- **列和范数（1-范数）**：$\|A\|_1 = \max_j \sum_i |a_{ij}|$（列绝对值和的最大值）
- **谱范数（2-范数）**：$\|A\|_2 = \sqrt{\rho(A^T A)}$（$\rho$ 为谱半径）
- **行和范数（∞-范数）**：$\|A\|_\infty = \max_i \sum_j |a_{ij}|$（行绝对值和的最大值）

---

## 迭代法收敛性判别准则

### 准则一：谱半径（充要条件）

$$\boxed{\rho(B) < 1 \iff \text{迭代收敛}}$$

其中 $\rho(B)$ 是迭代矩阵 $B$ 的**谱半径**：

$$\rho(B) = \max_i |\lambda_i|$$

| 条件 | 结论 |
|------|------|
| $\rho(B) < 1$ | 收敛，且 $\rho(B)$ 越小收敛越快 |
| $\rho(B) \geq 1$ | 发散 |

- ✅ **充要条件**，理论完备
- ❌ 需要计算特征值，计算量大

### 准则二：严格对角占优（充分条件）

$$\boxed{|a_{ii}| > \sum_{j \neq i} |a_{ij}| \quad \forall i \implies \text{Jacobi 和 Gauss-Seidel 均收敛}}$$

**示例**：

$$A = \begin{bmatrix} 4 & 1 & 1 \\ 1 & 3 & 1 \\ 1 & 1 & 5 \end{bmatrix}$$

| 行 | 对角元 $\|a_{ii}\|$ | 其余元素和 | 是否满足 |
|----|------------------|------------|----------|
| 1 | 4 | 1+1=2 | ✅ 4>2 |
| 2 | 3 | 1+1=2 | ✅ 3>2 |
| 3 | 5 | 1+1=2 | ✅ 5>2 |

**结论**：$A$ 严格对角占优 → Jacobi 和 Gauss-Seidel 均收敛。

> ⚠️ 仅为充分条件：不满足严格对角占优的矩阵**不一定发散**。

### 准则三：对称正定（充分条件，仅对 Gauss-Seidel）

$$\boxed{A \text{ 对称正定} \implies \text{Gauss-Seidel 收敛}}$$

**两个条件**：
1. **对称**：$A = A^T$
2. **正定**：所有特征值 $> 0$（或对所有非零向量 $x$，有 $x^T A x > 0$）

> ⚠️ 此条件**只保证 Gauss-Seidel 收敛**，对 Jacobi 迭代无法保证。

---

## 数值积分方法

### 1. 基本求积公式

$$\int_a^b f(x)\,dx \approx \sum_k A_k f(x_k)$$

- **左矩形公式**：$\displaystyle\int_a^b f(x)\,dx \approx (b-a)f(a)$

- **中矩形公式**：$\displaystyle\int_a^b f(x)\,dx \approx (b-a)f\!\left(\frac{a+b}{2}\right)$

- **梯形公式**（$n=1$）：$\displaystyle\int_a^b f(x)\,dx \approx \frac{b-a}{2}[f(a)+f(b)]$

- **Simpson 公式**（$n=2$）：

$$\int_a^b f(x)\,dx \approx \frac{b-a}{6}\left[f(a) + 4f\!\left(\frac{a+b}{2}\right) + f(b)\right]$$

- **Cotes 公式**（$n=4$）：

$$\int_a^b f(x)\,dx \approx \frac{b-a}{90}\left[7f_0 + 32f_1 + 12f_2 + 32f_3 + 7f_4\right]$$

### 2. 复合求积公式

设 $h = \dfrac{b-a}{n}$，节点 $x_k = a + kh$：

**复合梯形公式**：

$$T_n = \frac{h}{2}\left[f(a) + 2\sum_{k=1}^{n-1}f(x_k) + f(b)\right]$$

**复合 Simpson 公式**：

$$S_n = \frac{h}{6}\sum_{k=0}^{n-1}\left[f(x_k) + 4f\!\left(x_k+\frac{h}{2}\right) + f(x_{k+1})\right]$$

### 3. Romberg 算法

利用梯形公式外推逐步提高精度（Richardson 外推）：

$$R(n,1) = T_{2n} + \frac{T_{2n} - T_n}{3}$$

Romberg 表逐列精度依次提升。

### 4. Gauss 求积公式（高斯–勒让德公式）

$$\int_{-1}^{1} f(x)\,dx \approx \sum_{k=1}^n A_k f(x_k)$$

- **高斯点**：Legendre 多项式 $P_n(x)$ 的零点
- **代数精度**：$2n-1$（$n$ 个节点）

**区间变换**（$[a,b]$ 变换到 $[-1,1]$）：

$$\int_a^b f(x)\,dx = \frac{b-a}{2}\int_{-1}^1 f\!\left(\frac{b-a}{2}t + \frac{a+b}{2}\right)dt$$

---

## 常微分方程数值解

考虑初值问题 $y' = f(x, y)$，$y(x_0) = y_0$，步长 $h$。

### 1. Euler 法（显格式，一阶）

$$y_{n+1} = y_n + h\,f(x_n, y_n)$$

局部截断误差 $O(h^2)$，整体误差 $O(h)$。

### 2. 隐式 Euler 法（梯形格式）

$$y_{n+1} = y_n + h\,f(x_{n+1}, y_{n+1})$$

### 3. 改进 Euler 法（预估–校正，Heun 方法，二阶）

$$\begin{cases} \tilde{y}_{n+1} = y_n + h\,f(x_n, y_n) \\ y_{n+1} = y_n + \dfrac{h}{2}\left[f(x_n, y_n) + f(x_{n+1}, \tilde{y}_{n+1})\right] \end{cases}$$

整体误差 $O(h^2)$。

### 4. Runge–Kutta 三阶法

$$y_{n+1} = y_n + \frac{h}{6}(k_1 + 4k_2 + k_3)$$

$$k_1 = f(x_n, y_n), \quad k_2 = f\!\left(x_n+\frac{h}{2},\, y_n+\frac{h}{2}k_1\right), \quad k_3 = f(x_n+h,\, y_n - hk_1 + 2hk_2)$$

整体误差 $O(h^3)$。

### 5. Runge–Kutta 四阶法（经典 RK4）

$$y_{n+1} = y_n + \frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)$$

$$
\begin{array}{l}
k_1 = f(x_n, y_n) \\
k_2 = f\!\left(x_n+\frac{h}{2},\, y_n+\frac{h}{2}k_1\right) \\
k_3 = f\!\left(x_n+\frac{h}{2},\, y_n+\frac{h}{2}k_2\right) \\
k_4 = f(x_n+h,\, y_n+hk_3)
\end{array}
$$
整体误差 $O(h^4)$。

---
