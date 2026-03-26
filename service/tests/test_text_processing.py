from __future__ import annotations

import unittest

from service.app.core.text_processing import apply_dialect_rewrite, apply_style_tag, merge_style


class TextProcessingTests(unittest.TestCase):
    def test_merge_style_joins_non_empty_parts(self):
        self.assertEqual(merge_style("开心", None, "粤语"), "开心 粤语")

    def test_apply_style_tag_skips_inline_performance_prefix(self):
        text = "（小声）你好，我係小音。"
        self.assertEqual(apply_style_tag(text, "开心 粤语", False), text)

    def test_apply_style_tag_keeps_explicit_style_tag(self):
        text = "<style>粤语</style>你好"
        self.assertEqual(apply_style_tag(text, "开心", False), text)

    def test_apply_dialect_rewrite_for_short_cantonese_text(self):
        text = "你好，我是小音，这个真的不要。"
        self.assertEqual(apply_dialect_rewrite(text, "粤语"), "你好，我係小音，呢个真係唔好。")

    def test_apply_dialect_rewrite_is_conservative_for_long_text(self):
        text = "我是小音" * 30
        self.assertEqual(apply_dialect_rewrite(text, "粤语"), text)

    def test_apply_dialect_rewrite_ignored_for_other_dialects(self):
        text = "我是小音"
        self.assertEqual(apply_dialect_rewrite(text, "四川话"), text)


if __name__ == "__main__":
    unittest.main()
