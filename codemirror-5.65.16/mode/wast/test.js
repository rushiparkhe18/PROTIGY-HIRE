// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: https://codemirror.net/5/LICENSE

(function() {
  var mode = CodeMirror.getMode({indentUnit: 4}, "wast");
  function MT(name) {test.mode(name, mode, Array.prototype.slice.call(arguments, 1));}

  MT('number-test',
     '[number 0]',
     '[number 123]',
     '[number nan]',
     '[number inf]',
     '[number infinity]',
     '[number 0.1]',
     '[number 123.0]',
     '[number 12E+99]');

  MT('string-literals-test',
     '[string "foo"]',
     '[string "//"foo//""]',
     '[string "foo #//"# bar"]');

  MT('atom-test',
     '[atom funcref]',
     '[atom externref]',
     '[atom i32]',
     '[atom i64]',
     '[atom f32]',
     '[atom f64]');

  MT('keyword-test',
     '[keyword br]',
     '[keyword if]',
     '[keyword loop]',
     '[keyword i32.add]',
     '[keyword local.get]');

  MT('control-instructions',
     '[keyword unreachable]',
     '[keyword nop]',
     '[keyword br] [variable-2 $label0]',
     '[keyword br_if] [variable-2 $label0]',
     '[keyword br_table] [variable-2 $label0] [variable-2 $label1] [variable-2 $label3]',
     '[keyword return]',
     '[keyword call] [variable-2 $func0]',
     '[keyword call_indirect] [variable-2 $table] ([keyword param] [atom f32] [atom f64]) ([keyword result] [atom i32] [atom i64])',
     '[keyword return_call] [variable-2 $func0]',
     '[keyword return_call_indirect] ([keyword param] [atom f32] [atom f64]) ([keyword result] [atom i32] [atom i64])',
     '[keyword select] ([keyword local.get] [number 1]) ([keyword local.get] [number 2]) ([keyword local.get] [number 3])',
     '[keyword try] ([keyword result] [atom i32])',
     '[keyword throw] [number 0]',
     '[keyword rethrow] [number 0]',
     '[keyword catch] [number 0]',
     '[keyword catch_all]',
     '[keyword delegate] [number 0]',
     '[keyword unwind]');


  MT('memory-instructions',
     '[keyword i32.load] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i32.load8_s] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i32.load8_u] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i32.load16_s] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i32.load16_u] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i32.store] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i32.store8] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i32.store16] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i64.store] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i64.load] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i64.load8_s] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i64.load8_u] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i64.load16_s] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i64.load16_u] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i64.load32_s] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i64.load32_u] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i64.store8] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i64.store16] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword i64.store32] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword f32.load] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword f32.store] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword f64.load] [keyword offset]=[number 4] [keyword align]=[number 4]',
     '[keyword f64.store] [keyword offset]=[number 4] [keyword align]=[number 4]');

  MT('atomic-memory-instructions',
     '[keyword memory.atomic.notify] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword memory.atomic.wait32] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword memory.atomic.wait64] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.load] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.load8_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.load16_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.store] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.store8] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.store16] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.load] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.load8_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.load16_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.load32_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.store] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.store8] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.store16] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.store32] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw.add] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw8.add_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw16.add_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw.add] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw8.add_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw16.add_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw32.add_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw.sub] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw8.sub_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw16.sub_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw.sub] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw8.sub_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw16.sub_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw32.sub_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw.and] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw8.and_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw16.and_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw.and] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw8.and_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw16.and_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw32.and_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw.or] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw8.or_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw16.or_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw.or] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw8.or_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw16.or_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw32.or_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw.xor] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw8.xor_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw16.xor_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw.xor] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw8.xor_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw16.xor_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw32.xor_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw.xchg] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw8.xchg_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw16.xchg_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw.xchg] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw8.xchg_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw16.xchg_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw32.xchg_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw.cmpxchg] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw8.cmpxchg_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i32.atomic.rmw16.cmpxchg_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw.cmpxchg] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw8.cmpxchg_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw16.cmpxchg_u] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword i64.atomic.rmw32.cmpxchg_u] [keyword offset]=[number 32] [keyword align]=[number 4]');

  MT('simd-instructions',
     '[keyword v128.load] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword v128.load8x8_s] [keyword offset]=[number 64] [keyword align]=[number 0]',
     '[keyword v128.load8x8_u] [keyword offset]=[number 64] [keyword align]=[number 0]',
     '[keyword v128.load16x4_s] [keyword offset]=[number 64] [keyword align]=[number 0]',
     '[keyword v128.load16x4_u] [keyword offset]=[number 64] [keyword align]=[number 0]',
     '[keyword v128.load32x2_s] [keyword offset]=[number 64] [keyword align]=[number 0]',
     '[keyword v128.load32x2_u] [keyword offset]=[number 64] [keyword align]=[number 0]',
     '[keyword v128.load8_splat] [keyword offset]=[number 64] [keyword align]=[number 0]',
     '[keyword v128.load16_splat] [keyword offset]=[number 64] [keyword align]=[number 0]',
     '[keyword v128.load32_splat] [keyword offset]=[number 64] [keyword align]=[number 0]',
     '[keyword v128.load64_splat] [keyword offset]=[number 64] [keyword align]=[number 0]',
     '[keyword v128.store] [keyword offset]=[number 32] [keyword align]=[number 4]',
     '[keyword v128.const] [number 0] [number 1] [number 2] [number 3] [number 4] [number 5] [number 6] [number 7] [number 8] [number 9] [number 10] [number 11] [number 12] [number 13] [number 14] [number 15]',
     '[keyword i8x16.shuffle] [number 0] [number 1] [number 2] [number 3] [number 4] [number 5] [number 6] [number 7] [number 8] [number 9] [number 10] [number 11] [number 12] [number 13] [number 14] [number 15]',
     '[keyword i8x16.swizzle]',
     '[keyword i8x16.splat]',
     '[keyword i16x8.splat]',
     '[keyword i32x4.splat]',
     '[keyword i64x2.splat]',
     '[keyword f32x4.splat]',
     '[keyword f64x2.splat]',
     '[keyword i8x16.extract_lane_s] [number 1]',
     '[keyword i8x16.extract_lane_u] [number 1]',
     '[keyword i8x16.replace_lane] [number 1]',
     '[keyword i16x8.extract_lane_s] [number 1]',
     '[keyword i16x8.extract_lane_u] [number 1]',
     '[keyword i16x8.replace_lane] [number 1]',
     '[keyword i32x4.extract_lane] [number 1]',
     '[keyword i32x4.replace_lane] [number 1]',
     '[keyword i64x2.extract_lane] [number 1]',
     '[keyword i64x2.replace_lane] [number 1]',
     '[keyword f32x4.extract_lane] [number 1]',
     '[keyword f32x4.replace_lane] [number 1]',
     '[keyword f64x2.extract_lane] [number 1]',
     '[keyword f64x2.replace_lane] [number 1]',
     '[keyword i8x16.eq]',
     '[keyword i8x16.ne]',
     '[keyword i8x16.lt_s]',
     '[keyword i8x16.lt_u]',
     '[keyword i8x16.gt_s]',
     '[keyword i8x16.gt_u]',
     '[keyword i8x16.le_s]',
     '[keyword i8x16.le_u]',
     '[keyword i8x16.ge_s]',
     '[keyword i8x16.ge_u]',
     '[keyword i16x8.eq]',
     '[keyword i16x8.ne]',
     '[keyword i16x8.lt_s]',
     '[keyword i16x8.lt_u]',
     '[keyword i16x8.gt_s]',
     '[keyword i16x8.gt_u]',
     '[keyword i16x8.le_s]',
     '[keyword i16x8.le_u]',
     '[keyword i16x8.ge_s]',
     '[keyword i16x8.ge_u]',
     '[keyword i32x4.eq]',
     '[keyword i32x4.ne]',
     '[keyword i32x4.lt_s]',
     '[keyword i32x4.lt_u]',
     '[keyword i32x4.gt_s]',
     '[keyword i32x4.gt_u]',
     '[keyword i32x4.le_s]',
     '[keyword i32x4.le_u]',
     '[keyword i32x4.ge_s]',
     '[keyword i32x4.ge_u]',
     '[keyword f32x4.eq]',
     '[keyword f32x4.ne]',
     '[keyword f32x4.lt]',
     '[keyword f32x4.gt]',
     '[keyword f32x4.le]',
     '[keyword f32x4.ge]',
     '[keyword f64x2.eq]',
     '[keyword f64x2.ne]',
     '[keyword f64x2.lt]',
     '[keyword f64x2.gt]',
     '[keyword f64x2.le]',
     '[keyword f64x2.ge]',
     '[keyword v128.not]',
     '[keyword v128.and]',
     '[keyword v128.andnot]',
     '[keyword v128.or]',
     '[keyword v128.xor]',
     '[keyword v128.bitselect]',
     '[keyword v128.any_true]',
     '[keyword v128.load8_lane] [keyword offset]=[number 64] [keyword align]=[number 0] [number 1]',
     '[keyword v128.load16_lane] [keyword offset]=[number 64] [keyword align]=[number 0] [number 1]',
     '[keyword v128.load32_lane] [keyword offset]=[number 64] [keyword align]=[number 0] [number 1]',
     '[keyword v128.load64_lane] [keyword offset]=[number 64] [keyword align]=[number 0] [number 1]',
     '[keyword v128.store8_lane] [keyword offset]=[number 64] [keyword align]=[number 0] [number 1]',
     '[keyword v128.store16_lane] [keyword offset]=[number 64] [keyword align]=[number 0] [number 1]',
     '[keyword v128.store32_lane] [keyword offset]=[number 64] [keyword align]=[number 0] [number 1]',
     '[keyword v128.store64_lane] [keyword offset]=[number 64] [keyword align]=[number 0] [number 1]',
     '[keyword v128.load32_zero] [keyword offset]=[number 64] [keyword align]=[number 0]',
     '[keyword v128.load64_zero] [keyword offset]=[number 64] [keyword align]=[number 0]',
     '[keyword f32x4.demote_f64x2_zero]',
     '[keyword f64x2.promote_low_f32x4]',
     '[keyword i8x16.abs]',
     '[keyword i8x16.neg]',
     '[keyword i8x16.popcnt]',
     '[keyword i8x16.all_true]',
     '[keyword i8x16.bitmask]',
     '[keyword i8x16.narrow_i16x8_s]',
     '[keyword i8x16.narrow_i16x8_u]',
     '[keyword f32x4.ceil]',
     '[keyword f32x4.floor]',
     '[keyword f32x4.trunc]',
     '[keyword f32x4.nearest]',
     '[keyword i8x16.shl]',
     '[keyword i8x16.shr_s]',
     '[keyword i8x16.shr_u]',
     '[keyword i8x16.add]',
     '[keyword i8x16.add_sat_s]',
     '[keyword i8x16.add_sat_u]',
     '[keyword i8x16.sub]',
     '[keyword i8x16.sub_sat_s]',
     '[keyword i8x16.sub_sat_u]',
     '[keyword f64x2.ceil]',
     '[keyword f64x2.floor]',
     '[keyword i8x16.min_s]',
     '[keyword i8x16.min_u]',
     '[keyword i8x16.max_s]',
     '[keyword i8x16.max_u]',
     '[keyword f64x2.trunc]',
     '[keyword i8x16.avgr_u]',
     '[keyword i16x8.extadd_pairwise_i8x16_s]',
     '[keyword i16x8.extadd_pairwise_i8x16_u]',
     '[keyword i32x4.extadd_pairwise_i16x8_s]',
     '[keyword i32x4.extadd_pairwise_i16x8_u]',
     '[keyword i16x8.abs]',
     '[keyword i16x8.neg]',
     '[keyword i16x8.q15mulr_sat_s]',
     '[keyword i16x8.all_true]',
     '[keyword i16x8.bitmask]',
     '[keyword i16x8.narrow_i32x4_s]',
     '[keyword i16x8.narrow_i32x4_u]',
     '[keyword i16x8.extend_low_i8x16_s]',
     '[keyword i16x8.extend_high_i8x16_s]',
     '[keyword i16x8.extend_low_i8x16_u]',
     '[keyword i16x8.extend_high_i8x16_u]',
     '[keyword i16x8.shl]',
     '[keyword i16x8.shr_s]',
     '[keyword i16x8.shr_u]',
     '[keyword i16x8.add]',
     '[keyword i16x8.add_sat_s]',
     '[keyword i16x8.add_sat_u]',
     '[keyword i16x8.sub]',
     '[keyword i16x8.sub_sat_s]',
     '[keyword i16x8.sub_sat_u]',
     '[keyword f64x2.nearest]',
     '[keyword i16x8.mul]',
     '[keyword i16x8.min_s]',
     '[keyword i16x8.min_u]',
     '[keyword i16x8.max_s]',
     '[keyword i16x8.max_u]',
     '[keyword i16x8.avgr_u]',
     '[keyword i16x8.extmul_low_i8x16_s]',
     '[keyword i16x8.extmul_high_i8x16_s]',
     '[keyword i16x8.extmul_low_i8x16_u]',
     '[keyword i16x8.extmul_high_i8x16_u]',
     '[keyword i32x4.abs]',
     '[keyword i32x4.neg]',
     '[keyword i32x4.all_true]',
     '[keyword i32x4.bitmask]',
     '[keyword i32x4.extend_low_i16x8_s]',
     '[keyword i32x4.extend_high_i16x8_s]',
     '[keyword i32x4.extend_low_i16x8_u]',
     '[keyword i32x4.extend_high_i16x8_u]',
     '[keyword i32x4.shl]',
     '[keyword i32x4.shr_s]',
     '[keyword i32x4.shr_u]',
     '[keyword i32x4.add]',
     '[keyword i32x4.sub]',
     '[keyword i32x4.mul]',
     '[keyword i32x4.min_s]',
     '[keyword i32x4.min_u]',
     '[keyword i32x4.max_s]',
     '[keyword i32x4.max_u]',
     '[keyword i32x4.dot_i16x8_s]',
     '[keyword i32x4.extmul_low_i16x8_s]',
     '[keyword i32x4.extmul_high_i16x8_s]',
     '[keyword i32x4.extmul_low_i16x8_u]',
     '[keyword i32x4.extmul_high_i16x8_u]',
     '[keyword i64x2.abs]',
     '[keyword i64x2.neg]',
     '[keyword i64x2.all_true]',
     '[keyword i64x2.bitmask]',
     '[keyword i64x2.extend_low_i32x4_s]',
     '[keyword i64x2.extend_high_i32x4_s]',
     '[keyword i64x2.extend_low_i32x4_u]',
     '[keyword i64x2.extend_high_i32x4_u]',
     '[keyword i64x2.shl]',
     '[keyword i64x2.shr_s]',
     '[keyword i64x2.shr_u]',
     '[keyword i64x2.add]',
     '[keyword i64x2.sub]',
     '[keyword i64x2.mul]',
     '[keyword i64x2.eq]',
     '[keyword i64x2.ne]',
     '[keyword i64x2.lt_s]',
     '[keyword i64x2.gt_s]',
     '[keyword i64x2.le_s]',
     '[keyword i64x2.ge_s]',
     '[keyword i64x2.extmul_low_i32x4_s]',
     '[keyword i64x2.extmul_high_i32x4_s]',
     '[keyword i64x2.extmul_low_i32x4_u]',
     '[keyword i64x2.extmul_high_i32x4_u]',
     '[keyword f32x4.abs]',
     '[keyword f32x4.neg]',
     '[keyword f32x4.sqrt]',
     '[keyword f32x4.add]',
     '[keyword f32x4.sub]',
     '[keyword f32x4.mul]',
     '[keyword f32x4.div]',
     '[keyword f32x4.min]',
     '[keyword f32x4.max]',
     '[keyword f64x2.abs]',
     '[keyword f64x2.neg]',
     '[keyword f64x2.sqrt]',
     '[keyword f64x2.add]',
     '[keyword f64x2.sub]',
     '[keyword f64x2.mul]',
     '[keyword f64x2.div]',
     '[keyword f64x2.min]',
     '[keyword f64x2.max]',
     '[keyword i32x4.trunc_sat_f32x4_s]',
     '[keyword i32x4.trunc_sat_f32x4_u]',
     '[keyword f32x4.convert_i32x4_s]',
     '[keyword f32x4.convert_i32x4_u]',
     '[keyword i32x4.trunc_sat_f64x2_s_zero]',
     '[keyword i32x4.trunc_sat_f64x2_u_zero]',
     '[keyword f64x2.convert_low_i32x4_s]',
     '[keyword f64x2.convert_low_i32x4_u]');

     MT('reference-type-instructions',
     '[keyword ref.null] [keyword extern]',
     '[keyword ref.null] [keyword func]',
     '[keyword ref.is_null] ([keyword ref.func] [variable-2 $f])',
     '[keyword ref.func] [variable-2 $f]');

     MT('table-instructions',
     '[keyword table.get] [variable-2 $t] ([keyword i32.const] [number 5])',
     '[keyword table.set] [variable-2 $t] ([keyword i32.const] [number 5]) ([keyword ref.func] [variable-2 $f])',
     '[keyword table.size] [variable-2 $t]',
     '[keyword table.grow] [variable-2 $t] ([keyword ref.null] [keyword extern]) ([keyword i32.const] [number 5])',
     '[keyword table.fill] [variable-2 $t] ([keyword i32.const] [number 5]) ([keyword param] [variable-2 $r] [atom externref]) ([keyword i32.const] [number 5])',
     '[keyword table.init] [variable-2 $t] [number 1] ([keyword i32.const] [number 5]) ([keyword i32.const] [number 10]) ([keyword i32.const] [number 15])',
     '[keyword table.copy] [variable-2 $t] [variable-2 $t2] ([keyword i32.const] [number 5]) ([keyword i32.const] [number 10]) ([keyword i32.const] [number 15])'
     );
     MT('gc-proposal',
     '[keyword call_ref] [keyword return_call_ref]',
     '[keyword ref.as_non_null] [keyword br_on_null] [keyword ref.eq]');
     MT('gc-proposal-structs',
     '[keyword struct.new_with_rtt] [keyword struct.new_default_with_rtt]',
     '[keyword struct.get] [keyword struct.get_s] [keyword struct.get_u]',
     '[keyword struct.set]');
     MT('gc-proposal-arrays',
     '[keyword array.new_with_rtt] [keyword array.new_default_with_rtt]',
     '[keyword array.get] [keyword array.get_s] [keyword array.get_u]',
     '[keyword array.len] [keyword array.set]');
     MT('gc-proposal-i31',
     '[keyword i31.new] [keyword i31.get_s] [keyword i31.get_u]');
     MT('gc-proposal-rtt',
     '[keyword rtt.canon] [keyword rtt.sub]');
     MT('gc-proposal-typechecks',
     '[keyword ref.test] [keyword ref.cast] [keyword br_on_cast]',
     '[keyword ref.is_func] [keyword ref.is_data] [keyword ref.is_i31]',
     '[keyword ref.as_func] [keyword ref.as_data] [keyword ref.as_i31]',
     '[keyword br_on_func] [keyword br_on_data] [keyword br_on_i31]');
     MT('gc-proposal-types',
     '[atom i8] [atom i16]',
     '[atom anyref] [atom dataref] [atom eqref] [atom i31ref]');
})();
