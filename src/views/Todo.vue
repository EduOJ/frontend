<template>
  <page-header-wrapper>
    <diff :text="value"></diff>
  </page-header-wrapper>
</template>

<script>
import Diff from '@/components/Diff'
export default {
  name: 'Todo',
  components: { Diff },
  data () {
    return {
      value: `--- Expected
+++ Actual
@@ -58,16 +58,6 @@
     loc: (*time.Location)({
-     name: (string) (len=5) "Local",
-     zone: ([]time.zone) (len=3) {
+     name: (string) "",
+     zone: ([]time.zone) (len=1) {
       (time.zone) {
-       name: (string) (len=3) "LMT",
-       offset: (int) 29143,
-       isDST: (bool) false
-      },
-      (time.zone) {
-       name: (string) (len=3) "CDT",
-       offset: (int) 32400,
-       isDST: (bool) true
-      },
-      (time.zone) {
-       name: (string) (len=3) "CST",
+       name: (string) "",
        offset: (int) 28800,
@@ -76,180 +66,6 @@
      },
-     tx: ([]time.zoneTrans) (len=30) {
+     tx: ([]time.zoneTrans) (len=1) {
       (time.zoneTrans) {
-       when: (int64) -576460752303423488,
+       when: (int64) -9223372036854775808,
        index: (uint8) 0,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -2177481943,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -1600675200,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -1585904400,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -933667200,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -922093200,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -908870400,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -888829200,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -881049600,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -767869200,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -745833600,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -733827600,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -716889600,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -699613200,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -683884800,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -670669200,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -652348800,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -650019600,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 515527200,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 527014800,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 545162400,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 558464400,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 577216800,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 589914000,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 608666400,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 621968400,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 640116000,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 653418000,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 671565600,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 684867600,
-       index: (uint8) 2,
        isstd: (bool) false,
@@ -258,6 +74,6 @@
      },
-     cacheStart: (int64) 684867600,
+     cacheStart: (int64) -9223372036854775808,
      cacheEnd: (int64) 9223372036854775807,
      cacheZone: (*time.zone)({
-      name: (string) (len=3) "CST",
+      name: (string) "",
       offset: (int) 28800,
@@ -268,19 +84,9 @@
    UpdatedAt: (time.Time) {
-    wall: (uint64) 980143585,
+    wall: (uint64) 981026317,
     ext: (int64) 63749705567,
     loc: (*time.Location)({
-     name: (string) (len=5) "Local",
-     zone: ([]time.zone) (len=3) {
+     name: (string) "",
+     zone: ([]time.zone) (len=1) {
       (time.zone) {
-       name: (string) (len=3) "LMT",
-       offset: (int) 29143,
-       isDST: (bool) false
-      },
-      (time.zone) {
-       name: (string) (len=3) "CDT",
-       offset: (int) 32400,
-       isDST: (bool) true
-      },
-      (time.zone) {
-       name: (string) (len=3) "CST",
+       name: (string) "",
        offset: (int) 28800,
@@ -289,180 +95,6 @@
      },
-     tx: ([]time.zoneTrans) (len=30) {
+     tx: ([]time.zoneTrans) (len=1) {
       (time.zoneTrans) {
-       when: (int64) -576460752303423488,
+       when: (int64) -9223372036854775808,
        index: (uint8) 0,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -2177481943,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -1600675200,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -1585904400,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -933667200,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -922093200,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -908870400,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -888829200,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -881049600,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -767869200,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -745833600,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -733827600,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -716889600,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -699613200,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -683884800,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -670669200,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -652348800,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) -650019600,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 515527200,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 527014800,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 545162400,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 558464400,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 577216800,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 589914000,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 608666400,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 621968400,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 640116000,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 653418000,
-       index: (uint8) 2,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 671565600,
-       index: (uint8) 1,
-       isstd: (bool) false,
-       isutc: (bool) false
-      },
-      (time.zoneTrans) {
-       when: (int64) 684867600,
-       index: (uint8) 2,
        isstd: (bool) false,
@@ -471,6 +103,6 @@
      },
-     cacheStart: (int64) 684867600,
+     cacheStart: (int64) -9223372036854775808,
      cacheEnd: (int64) 9223372036854775807,
      cacheZone: (*time.zone)({
-      name: (string) (len=3) "CST",
+      name: (string) "",
       offset: (int) 28800,`
    }
  }
}
</script>

<style scoped>

</style>
