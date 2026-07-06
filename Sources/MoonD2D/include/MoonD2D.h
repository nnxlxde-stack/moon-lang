#pragma once

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct MoonD2DContext MoonD2DContext;

typedef struct MoonD2DColor {
    float r;
    float g;
    float b;
    float a;
} MoonD2DColor;

typedef struct MoonD2DRect {
    float x;
    float y;
    float width;
    float height;
} MoonD2DRect;

typedef enum MoonD2DTextStyle {
    MoonD2DTextStyleTitle = 0,
    MoonD2DTextStyleHeadline = 1,
    MoonD2DTextStyleBody = 2,
    MoonD2DTextStyleCaption = 3,
    MoonD2DTextStyleMonospace = 4,
} MoonD2DTextStyle;

MoonD2DContext* moon_d2d_create(void* hwnd, uint32_t width, uint32_t height);
void moon_d2d_destroy(MoonD2DContext* ctx);
bool moon_d2d_resize(MoonD2DContext* ctx, uint32_t width, uint32_t height);
void moon_d2d_begin_frame(MoonD2DContext* ctx, MoonD2DColor clear);
void moon_d2d_fill_round_rect(MoonD2DContext* ctx, MoonD2DRect rect, float radius, MoonD2DColor color);
void moon_d2d_draw_text(
    MoonD2DContext* ctx,
    const wchar_t* text,
    MoonD2DRect rect,
    MoonD2DTextStyle style,
    MoonD2DColor color
);
void moon_d2d_end_frame(MoonD2DContext* ctx);

#ifdef __cplusplus
}
#endif