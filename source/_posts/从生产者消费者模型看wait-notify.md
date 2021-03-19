---
title: '从生产者消费者模型看wait,notify'
catalog: true
date: 2021-03-18 18:18:15
subtitle:
header-img:
tags: 
- Java教程
categories:
- Java教程
---

## 一、前言

先来贴一段生产者，消费者模型的代码：

```java
public class Wait {

    public volatile static int count = 0;

    public static void main(String[] args) {


        System.out.println("开启10个生产者");
        for (int i = 0; i < 100; i++) {
            new Thread(new Producer(), "线程:" + i).start();
        }
        System.out.println("开启10个消费者");
        for (int i = 0; i < 100; i++) {
            new Thread(new Consumer(), "线程:" + i).start();
        }

    }
}

// 生产者
class Producer implements Runnable {
    @Override
    public void run() {
        synchronized (Wait.class) {
            System.out.println("生产者" + Thread.currentThread().getName() + "准备生产");
            while (Wait.count >= 10) {
                System.out.println("队列已满，生产者" + Thread.currentThread().getName() + "停止生产");
                try {
                    Wait.class.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            System.out.println("生产者" + Thread.currentThread().getName() + "生产完毕");
            Wait.count++;
            System.out.println("生产者" + Thread.currentThread().getName() + "唤醒其他线程");
            Wait.class.notifyAll();
            System.out.println("当前count值" + Wait.count);
        }
    }
}

// 消费者
class Consumer implements Runnable {
    @Override
    public void run() {
        synchronized (Wait.class) {
            System.out.println("消费者" + Thread.currentThread().getName() + "准备消费");
            while (Wait.count <= 0) {
                System.out.println("队列已空，消费者" + Thread.currentThread().getName() + "停止消费");
                try {
                    Wait.class.wait();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            System.out.println("消费者" + Thread.currentThread().getName() + "消费完毕");
            Wait.count--;
            System.out.println("消费者" + Thread.currentThread().getName() + "唤醒其他线程");
            Wait.class.notifyAll();
            System.out.println("当前count值" + Wait.count);
        }
    }
}
```

## 二、为什么wait与notify只能在synchronized代码块中执行

首先我们要知道，wait 与 notify 方法是属于 Object 的，每个对象都拥有这两个方法，这与线程特有的方法不同。

synchronized 代码块使用的是对象内置的监视器锁，每个对象都拥有自己的监视器锁，而 wait，notify 方法实际上也是在锁对象上执行的。只有在 synchronized 代码块中才使用了锁对象，所以调用 wait，notify 才有意义。

了解一下前置知识：
JVM 会为每个锁对象维护两个集合，Entry Set 与 Wait Set，如果一个线程 A，持有了该锁对象，那么对于其余的线程想要获取该锁对象的话，它只能进入 Entry Set，并且此时线程处于 BLOCKED 状态；如果一个线程 A 调用了锁对象的 wait 方法，那么线程 A 会释放锁对象，之后进入锁对象的 Wait Set 中，并且处于 WAITING 状态。

当前线程调用锁对象的 wait 方法，首先会释放锁，然后进入锁对象的 Wait Set 中；当前线程调用锁对象的 notify 方法，会从锁对象的 Wait Set 中唤醒一个线程。

## 三、为什么生产者消费者要用 while 循环做判断

以消费者为例，在调用锁对象的 wait 方法时，使用的是 while 循环，如果将 while 循环换成 if 条件会产生什么问题？

考虑一种情况，消费者 A 在 wait 方法停住，消费者 B 消费了最后一个资源，调用 notify 唤醒了消费者 A，消费者 A 直接从 wait 方法往下走，此时资源为空，就会导致出现问题。如果使用 while 循环，那么消费者 A 被唤醒后，还是会判断一次资源情况，就不会出现问题。

## 四、为什么要用 notifyAll 不用 notify

还是以消费者为例，如果用的是 notify，一个消费者消费了最后一个资源，然后又唤醒了一个消费者，被唤醒的消费者以为没有资源而进入等待状态，此时所有的线程都在 wait ，也就是造成了死锁问题。

## 五、能不能用 Lock 实现生产者消费者

notifyAll 会造成性能问题，可以用 Lock 锁对象实现生产者消费者：

代码实例：

```Java
public class PAndC {

    private volatile static int i = 0;

    private static Lock lock = new ReentrantLock();
    private static Condition producerSet = lock.newCondition();
    private static Condition consumerSet = lock.newCondition();

    public static void main(String[] args) {
        for (int j = 0; j < 5; j++) {
            new Thread(() -> {
                while(true){
                    lock.lock();
                    try {
                        if(i >= 10){
                            System.out.println(Thread.currentThread().getName() + "等待");
                            producerSet.await();
                        }
                        System.out.println(Thread.currentThread().getName() + "生产");
                        i ++;
                        System.out.println(Thread.currentThread().getName() + "通知其他人");
                        consumerSet.signal();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    } finally {
                        lock.unlock();
                    }
                }
            },"生产者").start();
        }

        for (int j = 0; j < 10; j++) {
            new Thread(() -> {
                while(true){
                    lock.lock();
                    try {
                        if(i <= 0){
                            System.out.println(Thread.currentThread().getName() + "等待");
                            consumerSet.await();
                        }
                        System.out.println(Thread.currentThread().getName() + "消费");
                        i --;
                        System.out.println(Thread.currentThread().getName() + "通知其他人");
                        producerSet.signal();
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    } finally {
                        lock.unlock();
                    }
                }

            },"消费者").start();
        }

    }
}

```

Lock 对象可以创建多个等待集，所以可以指定唤醒哪个等待集中的线程，不会出现唤醒相同类型线程导致的问题。
其中，Lock 对象相当于监视器锁，condition 集相当于 Wait Set，await 方法相当于 wait 方法，signal 方法相当于 notify 方法。

## 六、总结

1. wait notify 是属于锁对象的方法，操作的是锁对象维护的集合，集合中存放的是线程；
2. 永远要在 while 循环中调用 wait 方法；
3. 使用 Lock 对象能获得更好的操作；