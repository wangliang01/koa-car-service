# 汽车维修管理系统

## 维修业务流程图

```mermaid
flowchart TD
    Start([开始]) --> A[车辆进厂]
    A --> B[环车检查确认客户物品]
    B --> C[接车登记]
    C --> D[初步检测]
    D --> E[维修报价]
    E --> F{客户确认签字}
    F -->|新故障| E
    F -->|确认| G[维修派工]
    G --> H[维修作业]
    H --> I[领料/配件材料]
    I --> J[完工检测]
    J --> K{合格}
    K -->|不合格| H
    K -->|合格| L[维修结算]
    L --> M[竣工出厂合格证]
    M --> N[开出门条]
    N --> O[售后服务跟踪]
    O --> End([结束])
```

### 库存管理流程

```mermaid
flowchart TD
    Start([开始]) --> A[库存检查]
    A --> B{库存预警}
    B -->|库存充足| C[正常使用]
    B -->|低于阈值| D[生成采购计划]
    D --> E[采购申请]
    E --> F{审批}
    F -->|拒绝| D
    F -->|通过| G[供应商报价]
    G --> H[确认订单]
    H --> I[配件入库]
    I --> J[质检]
    J -->|不合格| K[退货处理]
    J -->|合格| L[入库登记]
    L --> M[更新库存]
    M --> End([结束])
```

### 结算流

```mermaid
flowchart TD
    Start([开始]) --> A[维修完工]
    A --> B[生成结算单]
    B --> C[客户确认]
    C --> D{支付方式}
    D -->|现金| E[现金收款]
    D -->|刷卡| F[POS机结算]
    D -->|其他| G[其他支付方式]
    E & F & G --> H[打印发票]
    H --> I[更新账目]
    I --> J[归档]
    J --> End([结束])
```

### 用户权限流程

```mermaid
flowchart TD
    Start([开始]) --> A[用户注册]
    A --> B[填写信息]
    B --> C[验证信息]
    C --> D{验证通过}
    D -->|否| B
    D -->|是| E[创建账户]
    E --> F[分配角色]
    F --> G[设置权限]
    G --> H[登录系统]
    H --> I{认证通过}
    I -->|否| H
    I -->|是| J[获取权限]
    J --> K[访问控制]
    K --> L{权限验证}
    L -->|无权限| M[提示错误]
    L -->|有权限| N[使用功能]
    N --> End([结束])
```

## 功能模块清单

### 1. 用户管理 ✓

- 用户注册 ✓
- 用户登录 ✓
- 密码修改 ✓
- 个人信息管理 ✓
- 刷新令牌 ✓
- 账号注销 ✓

### 2. 客户管理 ✓

- 新增客户 ✓
- 查询客户列表 ✓
- 查看客户详情 ✓
- 修改客户信息 ✓
- 删除客户 ✓

### 3. 车辆管理 ✓

- 新增车辆 ✓
- 查询车辆列表 ✓
- 查看车辆详情 ✓
- 修改车辆信息 ✓
- 删除车辆 ✓

### 4. 维修工单管理 ❌

- 接车登记 TODO
  - 基本信息登记
  - 环车检查记录
  - 维修需求记录
- 维修报价 TODO
  - 生成报价单
  - 客户确认签字
- 维修处理 TODO
  - 维修派工
  - 配件领用
  - 维修记录
- 完工处理 TODO
  - 完工检测
  - 出厂手续

### 5. 配件库存管理 ❌

- 库存查询 TODO
- 配件出入库 TODO
- 库存预警 TODO
- 供应商管理 TODO

### 6. 结算管理 ❌

- 结算单生成 TODO
- 收款管理 TODO
- 发票管理 TODO

### 7. 系统管理 ❌

- 角色权限管理 TODO
- 系统参数配置 TODO
- 数据字典管理 TODO
- 操作日志查询 TODO
- 系统备份恢复 TODO

## 技术栈

### 后端

- Node.js
- Koa2
- MongoDB
- JWT 认证
- RESTful API

### 开发工具

- Docker ✓
- Git ✓
- Jest (测试) TODO
- Winston (日志) ✓
- ESLint (代码规范) TODO

## 项目进度

- [x] 基础框架搭建
- [x] 用户认证模块
- [x] 客户管理模块
- [x] 车辆管理模块
- [ ] 维修工单管理模块
- [ ] 配件库存管理模块
- [ ] 结算管理模块
- [ ] 系统管理模块
