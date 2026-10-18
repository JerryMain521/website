---
title: 'README'
description: 'The first description file.'
publishDate: '2026-04-21 17:17:28'
tags:
  - README
draft: false
comment: true
---

人类著名构史学家*JerryMin*曾经说过：

>这个Astro模板 (https://github.com/cworld1/astro-theme-pure) 是我目前见过最舒适的模板了！

*JerryMin*对这个网页爱不释手，他不仅立flag说要频繁更新~~开始画饼~~，也希望给想要基于此模板进行客制化的各位提供一种方案~~又画一张~~，以及试图以最简单的方式，说明对原项目做了哪些更改以及更改的方式。

所以他就写了这样一段markdown作为参考，而我跟着他的教程，创建了此网站，遂将其搬运过来。

## 图片替换
### 网页图标替换
> 网页图标就是最上面那个图片，最初大概是这样的：
>
> ![old_header](old_header.png)
>
> 我们的目标是变成这样：
>
> ![new_header](new_header.png)
> 下面是简单的操作步骤。

下图为<strong>示例图标</strong>，用这个网站 [favicon.io](https://favicon.io) 将其转化为`.ico`文件：

![favicon](android-chrome-192x192.png)

你会得到一个`.zip`压缩包，解压后的一堆文件是这样：
```bash
android-chrome-192x192.png
android-chrome-512x512.png
apple-touch-icon.png
favicon-16x16.png
favicon-32x32.png
favicon.ico
site.webmanifest
```
直接原封不动的复制<del>（替换）</del>到目录即可：
```bash
./public/favicon
```

### 主页头像替换
主页头像的位置在：
```bash
./src/assets/avatar.png
```
直接用你保存好的图片替换即可，不过需要文件名和后缀相同，否则需要更改源码。

## 网站的基本信息更改
### site.config.ts更改
此文件直译过来是：**网站注册表**，个人理解为网站信息的注册地，`.ts`后缀代表用`typescript`编写。此文件在项目中的地址为：
```bash
./src/site.config.ts
```
利用`Ctrl + F`查找文件的一些关键字，这里一一列出，注释都已表明在源文件，这里不作展示：
- title 即网页的名字，如下图：

![](./old_header.png)

![](./new_header.png)

它们写在下列字段，你可以用你的眼睛一行一行搜索，但还是建议使用`Ctrl + F`查找：
```typescript
title: 'Astro Theme Pure'
title: 'JerryMain Island'
```

当然title的改变也会影响导航栏的改变，如下图左侧内容：

![](./old_nav.png)

![](./new_nav.png)

- author 即网页的所有者，如下图：

|  |  |
|:---:|:---:|
| ![](./old_avatar.png) | ![](./new_avatar.png) |

与上述同理，使用`Ctrl + F`查找下列字段并修改：

```typescript
author: 'Pure Lab'
author: 'JerryMain'
```

当然这里只说明了author的更改，至于定位、网页以及头像的更改可以跳转到[下文](#博客主页面mainpage更改)的第一部分。


- description 个人介绍，原文是乔布斯的名言，可以自行更改：
```typescript
description: 'Stay hungry, stay foolish'
description: 'Stay stupid, stay android'
```
- navigation 即导航栏，也就是下图右侧的内容：

![](./old_nav.png)

![](./new_nav.png)

你可以找到这样的字段进行更改，我个人删除了`Docs`官方说明文档：

```typescript
  header: {
    menu: [
      { title: 'Blog', link: '/blog' },
      //docs是官方说明文档，可以有选择性的删除此行
      { title: 'Docs', link: '/docs' },   
      { title: 'Projects', link: '/projects' },
      { title: 'Links', link: '/links' },
      { title: 'About', link: '/about' }
    ]
  }
```
- ICP 即网络内容服务商，按照相关要求进行填写即可，它的显示位置在页脚左侧：

![](./old_footer.png)

![](./new_footer.png)

```typescript
title: 'Moe ICP 114514'
title: 'Your ICP'
```
- GitHub Page 即页脚指向的仓库，位置在上图右侧，可通过以下字段查询：
```typescript
social: [
  { icon: 'github', label: 'GitHub', href: 'https://github.com/cworld1/astro-theme-pure' },
  { icon: 'rss', label: 'RSS', href: '/rss.xml' }
]
```
对于这条代码的处理方法稍有不同，各位可**酌情借鉴**，这里不作展开：
```typescript
social: { github: 'https://github.com/JerryMain521/website' }
```
- Link 即你网站的主页地址：
```typescript
name: 'Link', val: 'https://astro-pure.js.org/'
name: 'Link', val: 'https://jerrymain.top/'
```
- Avatar 就是显示在页面上的头像图片，它直接引用了你网站`/favicon/`目录下的图标文件作为头像，我们直接替换前面的网址就可以：
```typescript
name: 'Avatar', val: 'https://astro-pure.js.org/favicon/favicon.ico' 
name: 'Avatar', val: 'https://jerrymain.top/favicon/favicon.ico' 
```

### 博客主页面（MainPage）更改

![](./new_mainpage.png)

这是我们一进来的界面，这个界面就是主页面。前面只介绍了部分细节的更改，这里做全部的解释。

你需要在这个路径中找到MainPage的源代码：

```bash
./src/pages/index.astro
```

在前面我们已经讲过了关于`author`的更改，这里再放出对比图，下面就是要换地址和仓库：

|  |  |
|:---:|:---:|
| ![](./old_avatar.png) | ![](./new_avatar.png) |

- 这里是地址，搜索到此字段后，可以将`Somewhere`改成你想改的地址：
```typescript
<Label title='Somewhere'>
<Label title='Southeast University'>
```

- 这里是你的GitHub仓库地址，搜到后可以将`title`和`href`字段改成你的信息：
```typescript
<Label
  title='Source code'                                 //here
  as='a'
  href='https://github.com/cworld1/astro-theme-pure'  //here
  target='_blank'
>
```

- 细心一点的话可以观察到在下方有一个图标：

![](get_template.png)

这是作者给此模板建立的一个仓库通道，你可以选择利用注释删除获保留。它的源代码是这样的：
```typescript
{/* Get template */}
<a
href='https://github.com/cworld1/astro-theme-pure'
target='_blank'
class='flex flex-row items-center gap-x-3 rounded-full border bg-background px-4 py-2 text-sm shadow-sm transition-shadow hover:shadow-md'
>
  <span class='relative flex items-center justify-center'>
    <span
    class='absolute size-2 animate-ping rounded-full border border-green-400  bg-green-400 opacity-75'
    ></span>
    <span class='size-2 rounded-full bg-green-400'></span>
  </span>
  <p class='font-medium text-muted-foreground'>Get Template</p>
</a>
```

- 下面是首页介绍更改，在页面位置如下：

![alt text](image.png)

代码如下，可以自行更改如`Developer / Designer`的字样：
```typescript
<Section title='About'>
  <p class='text-muted-foreground'>Developer / Designer</p>
  <p class='text-muted-foreground'>
    Lorem ipsum dolor sit amet, vidit suscipit at mei. Quem denique mea id. Usu ei regione
    indoctum dissentiunt, cu meliore fuisset mei, vel quod voluptua ne. Ex dicat impedit mel,
    at eum oratio possit voluptatum.
  </p>
  <Button title='More about me' class='w-fit self-end' href='/about' variant='ahead' />
</Section>
```

- 教育经历更改：

![alt text](image-1.png)

源码如下：
```typescript
<Section title='Education'>
  <Card
    as='a'
    heading='Lorem ipsum'
    subheading='Lorem ipsum dolor sit amet, vidit suscipit at mei.'
    date='August 2021 - July 2025'
    href='https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  >
    {
      /* <ul class='ms-4 list-disc text-muted-foreground'>
    <li>
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolore debitis recusandae, ut
      molestiae laboriosam pariatur!
    </li>
    <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae, pariatur!</li>
  </ul> */
    }
  </Card>
</Section>
```
我做了一点更改：
```typescript
<Section title='Education'>
  <Card
    as='a'
    heading='Southeast University'
    subheading='Majoring in Integrated Circuit Design and Integrated System'
    date='August 2024 - July 2028'
    href='https://www.seu.edu.cn/'
  >
    <img
      class='absolute end-0 z-0 m-0 -my-3 h-full w-1/2 object-cover opacity-40'
      src='/images/seu.svg'
    />
    {
      /* <ul class='ms-4 list-disc text-muted-foreground'>
    <li>
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Dolore debitis recusandae, ut
      molestiae laboriosam pariatur!
    </li>
    <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae, pariatur!</li>
  </ul> */
    }
  </Card>
</Section>
```
- Website List
```typescript
<Section title='Website List'>
  <div class='grid grid-cols-1 gap-3 sm:grid-cols-2'>
    <ProjectCard
      href='https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      heading='Lorem ipsum'
      subheading='Do not go gentle into that good night'
      imagePath='/src/assets/projects/1.avif'
    />
    <ProjectCard
      href='https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      heading='Lorem ipsum'
      subheading='Old age burn and rave at close of day'
      imagePath='/src/assets/projects/2.avif'
    />
    <ProjectCard
      href='https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      heading='Lorem ipsum'
      subheading='Rage, rage against the dying of the light'
      imagePath='/src/assets/projects/3.avif'
    />
    <ProjectCard
      href='/projects'
      heading='More projects'
      subheading='Check out more projects'
      imagePath='/src/assets/projects/4.avif'
    />
  </div>
</Section>
```
- Certifications更改
```typescript
<Section title='Certifications'>
  <Card
     as='a'
    heading='Lorem ipsum'
    subheading='Lorem ipsum dolor sit amet, vidit suscipit at mei. Quem denique mea id. Usu ei regione indoctum dissentiunt, cu meliore fuisset mei, vel quod voluptua ne. Ex dicat impedit mel, at eum oratio possit voluptatum. Dicat ceteros cu vim. Impetus fuisset ullamcorper pri cu, his posse iisque ad, aliquam honestatis usu id.'
    date='July 2024'
    href='https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  />
</Section>
```
- Skills
```typescript
<Section title='Skills'>
  <SkillLayout title='Languages' skills={languages} />
  <SkillLayout title='Frontend' skills={frontend} />
  <SkillLayout title='Backend' skills={backend} />
</Section>
```
### about的index.astro
文件地址为：
```bash
./src/pages/about/index.astro
```
下面拆解这个文件的内容，当然如果你能看懂HTML的话就<del>可以跳过</del>：

- 自我介绍

![alt text](image-2.png)
```astro
  <p>Developer / Designer</p>
  <p>
    Lorem ipsum dolor sit amet, vidit suscipit at mei. Quem denique mea id. Usu ei regione indoctum
    dissentiunt, cu meliore fuisset mei, vel quod voluptua ne. Ex dicat impedit mel, at eum oratio
    possit voluptatum.
  </p>
  <p>
    Motto: Stay hungry, Stay foolish. <Spoiler>这里可以夹私货，比如为什么要演奏春日影！</Spoiler>
  </p>
```
- 赞助按钮，可以选择删除与否

![alt text](image-3.png)
```astro
  <Button title='Sponsor Me' class='w-fit' href='/projects#sponsorship' variant='ahead' />
```
```astro
  {/* general-talk */}
  <h2 id='hobbies'>Hobbies</h2>
  <ul>
    <li>Lorem ipsum dolor sit amet, vidit suscipit at mei.</li>
    <li>
      Quem denique mea id. Usu ei regione indoctum dissentiunt, cu meliore fuisset mei, vel quod
      voluptua ne.
    </li>
    <li>Ex dicat impedit mel, at eum oratio possit voluptatum.</li>
    <li>Impetus fuisset ullamcorper pri cu, his posse iisque ad, aliquam honestatis usu id.</li>
  </ul>
```
```astro
  <ToolSection
    class='mb-5'
    title='Design'
    tools={[
      {
        name: 'Photoshop',
        description: 'Picture Editing',
        href: 'https://www.adobe.com/products/photoshop',
        icon: import('@/assets/tools/photoshop.svg?raw')
      }
    ]}
     ...
  />
```
```astro
  {/* social-networks */}
  <h2 id='social-networks'>Social Networks</h2>
  <p>
    Lorem ipsum dolor sit amet, vidit suscipit at mei. Quem denique mea id. Usu ei regione indoctum
    dissentiunt, cu meliore fuisset mei, vel quod voluptua ne.
  </p>
```
```astro
  <Substats
    stats={[
      {
        platform: 'GitHub',
        icon: 'github',
        link: 'https://github.com/cworld1',
        text: 'followers',
        api: 'github/cworld1'
      }
    ]}
    ...
  />
```
```astro
  {/* gossips */}
  <h2 id='gossips'>Gossips</h2>
  <Collapse title='Lorem ipsum'>
    Lorem ipsum dolor sit amet, vidit suscipit at mei. Quem denique mea id. Usu ei regione indoctum
    dissentiunt, cu meliore fuisset mei, vel quod voluptua ne. Ex dicat impedit mel, at eum oratio
    possit voluptatum.
  </Collapse>
```
```astro
  <Timeline
    events={[
      {
        date: '2024-04-29',
        content:
          'Website refactored using <a href="https://astro.build/" target="_blank">Astro</a> and <a href="https://github.com/srleom/astro-theme-resume" target="_blank">Astro Theme Resume</a>'
      }
    ]}
    ...
  />
```
```astro
  <p>
    The smooth operation and personalized customization of website also rely on the resources and
    technical support provided by the following excellent projects/service providers:
  </p>
```
```astro
    <li>
      Domain: <a href='#' target='_blank'>Vercel</a>
    </li>
```

### links的index.astro
文件地址为：
```bash
./src/pages/links/index.astro
```

但是这只是一个调用文件，真正的内容在：
```bash
./public/links.json
```
可以按照下方的格式更改：
```json
{
  "friends": [
    {
      "id_name": "cf-links",
      "desc": "Common links included in circle friends",
      "link_list": [
        {
          "name": "ByteString",
          "intro": "我去，不早说",
          "link": "https://bytestring.top",
          "avatar": "/friends/bytestring.webp"
        }
      ]
    },
    {
      "id_name": "inactive-links",
      "desc": "Inactive or rule-breaking friends",
      "link_list": []
    },
    {
      "id_name": "special-links",
      "desc": "Other special links",
      "link_list": []
    }
  ]
}
```
### projects的index.astro
文件地址为：
```bash
./src/pages/projects/index.astro
```
页面分为三部分**My Repositories**,**Friends Repositories**和**SponsorShip**