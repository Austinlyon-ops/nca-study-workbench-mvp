import test from 'node:test';
import assert from 'node:assert/strict';
import { authorized, channelOf, digest } from '../api/state.mjs';

test('云端口令用 SHA-256 常量时间比对，原文不进入配置', () => {
  const token = 'synthetic-cloud-passphrase-12345';
  const hash = digest(token);
  assert.equal(authorized(`Bearer ${token}`, hash), true);
  assert.equal(authorized('Bearer wrong-but-still-long-token', hash), false);
  assert.equal(hash.includes(token), false);
});

test('桌面和网页数据使用独立通道，避免不同状态结构互相覆盖', () => {
  assert.equal(channelOf({ url:'/api/state?channel=desktop' }), 'desktop');
  assert.equal(channelOf({ url:'/api/state?channel=web' }), 'web');
  assert.throws(() => channelOf({ url:'/api/state?channel=other' }), /同步通道无效/);
});
