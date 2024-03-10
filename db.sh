#!/bin/sh

bun db:push
bun db:del
bun db:seed