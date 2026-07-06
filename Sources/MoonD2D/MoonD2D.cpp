#include "MoonD2D.h"

#ifdef _WIN32

#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#include <windows.h>
#include <d2d1.h>
#include <dwrite.h>
#include <wrl/client.h>

#include <algorithm>
#include <memory>
#include <string>

using Microsoft::WRL::ComPtr;

struct MoonD2DContext {
    HWND hwnd = nullptr;
    ComPtr<ID2D1Factory> factory;
    ComPtr<ID2D1HwndRenderTarget> target;
    ComPtr<IDWriteFactory> writeFactory;
    bool comInitialized = false;
};

static D2D1_COLOR_F toD2DColor(MoonD2DColor color) {
    return D2D1::ColorF(color.r, color.g, color.b, color.a);
}

static D2D1_RECT_F toD2DRect(MoonD2DRect rect) {
    return D2D1::RectF(rect.x, rect.y, rect.x + rect.width, rect.y + rect.height);
}

static void textFormat(
    IDWriteFactory* writeFactory,
    MoonD2DTextStyle style,
    ComPtr<IDWriteTextFormat>& outFormat
) {
    const wchar_t* family = L"Segoe UI";
    float size = 16.0f;
    DWRITE_FONT_WEIGHT weight = DWRITE_FONT_WEIGHT_NORMAL;

    switch (style) {
    case MoonD2DTextStyleTitle:
        size = 28.0f;
        weight = DWRITE_FONT_WEIGHT_SEMI_BOLD;
        break;
    case MoonD2DTextStyleHeadline:
        size = 22.0f;
        weight = DWRITE_FONT_WEIGHT_SEMI_BOLD;
        break;
    case MoonD2DTextStyleBody:
        size = 16.0f;
        break;
    case MoonD2DTextStyleCaption:
        size = 12.0f;
        break;
    case MoonD2DTextStyleMonospace:
        family = L"Cascadia Mono";
        size = 14.0f;
        break;
    }

    writeFactory->CreateTextFormat(
        family,
        nullptr,
        weight,
        DWRITE_FONT_STYLE_NORMAL,
        DWRITE_FONT_STRETCH_NORMAL,
        size,
        L"en-us",
        &outFormat
    );
}

static bool ensureTarget(MoonD2DContext* ctx, uint32_t width, uint32_t height) {
    if (!ctx || !ctx->hwnd || !ctx->factory) {
        return false;
    }
    if (ctx->target) {
        return true;
    }

    RECT rc{};
    GetClientRect(ctx->hwnd, &rc);
    const UINT w = width > 0 ? width : static_cast<UINT>(std::max<LONG>(1, rc.right - rc.left));
    const UINT h = height > 0 ? height : static_cast<UINT>(std::max<LONG>(1, rc.bottom - rc.top));
    const D2D1_SIZE_U size = D2D1::SizeU(w, h);

    ComPtr<ID2D1HwndRenderTarget> target;
    const HRESULT hr = ctx->factory->CreateHwndRenderTarget(
        D2D1::RenderTargetProperties(),
        D2D1::HwndRenderTargetProperties(ctx->hwnd, size),
        &target
    );
    if (FAILED(hr)) {
        return false;
    }
    ctx->target = target;
    return true;
}

extern "C" MoonD2DContext* moon_d2d_create(void* hwnd, uint32_t width, uint32_t height) {
    auto* ctx = new MoonD2DContext();
    ctx->hwnd = static_cast<HWND>(hwnd);

    const HRESULT comHr = CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);
    if (SUCCEEDED(comHr)) {
        ctx->comInitialized = true;
    } else if (comHr != RPC_E_CHANGED_MODE) {
        moon_d2d_destroy(ctx);
        return nullptr;
    }

    if (FAILED(D2D1CreateFactory(D2D1_FACTORY_TYPE_SINGLE_THREADED, ctx->factory.GetAddressOf()))) {
        moon_d2d_destroy(ctx);
        return nullptr;
    }

    if (FAILED(DWriteCreateFactory(
            DWRITE_FACTORY_TYPE_SHARED,
            __uuidof(IDWriteFactory),
            reinterpret_cast<IUnknown**>(ctx->writeFactory.GetAddressOf())
        ))) {
        moon_d2d_destroy(ctx);
        return nullptr;
    }

    if (!ensureTarget(ctx, width, height)) {
        moon_d2d_destroy(ctx);
        return nullptr;
    }

    return ctx;
}

extern "C" void moon_d2d_destroy(MoonD2DContext* ctx) {
    if (!ctx) {
        return;
    }
    ctx->target.Reset();
    ctx->writeFactory.Reset();
    ctx->factory.Reset();
    if (ctx->comInitialized) {
        CoUninitialize();
    }
    delete ctx;
}

extern "C" bool moon_d2d_resize(MoonD2DContext* ctx, uint32_t width, uint32_t height) {
    if (!ctx) {
        return false;
    }
    if (!ctx->target) {
        return ensureTarget(ctx, width, height);
    }
    const D2D1_SIZE_U size = D2D1::SizeU(std::max<uint32_t>(1, width), std::max<uint32_t>(1, height));
    return SUCCEEDED(ctx->target->Resize(size));
}

extern "C" void moon_d2d_begin_frame(MoonD2DContext* ctx, MoonD2DColor clear) {
    if (!ctx || !ctx->target) {
        return;
    }
    ctx->target->BeginDraw();
    ctx->target->Clear(toD2DColor(clear));
}

extern "C" void moon_d2d_fill_round_rect(
    MoonD2DContext* ctx,
    MoonD2DRect rect,
    float radius,
    MoonD2DColor color
) {
    if (!ctx || !ctx->target) {
        return;
    }
    ComPtr<ID2D1SolidColorBrush> brush;
    if (FAILED(ctx->target->CreateSolidColorBrush(toD2DColor(color), &brush))) {
        return;
    }
    const D2D1_ROUNDED_RECT rounded = {
        toD2DRect(rect),
        radius,
        radius,
    };
    ctx->target->FillRoundedRectangle(rounded, brush.Get());
}

extern "C" void moon_d2d_draw_text(
    MoonD2DContext* ctx,
    const wchar_t* text,
    MoonD2DRect rect,
    MoonD2DTextStyle style,
    MoonD2DColor color
) {
    if (!ctx || !ctx->target || !ctx->writeFactory || !text) {
        return;
    }

    ComPtr<IDWriteTextFormat> format;
    textFormat(ctx->writeFactory.Get(), style, format);
    if (!format) {
        return;
    }
    format->SetTextAlignment(DWRITE_TEXT_ALIGNMENT_CENTER);
    format->SetParagraphAlignment(DWRITE_PARAGRAPH_ALIGNMENT_CENTER);

    const size_t length = wcslen(text);
    ComPtr<IDWriteTextLayout> layout;
    if (FAILED(ctx->writeFactory->CreateTextLayout(
            text,
            static_cast<UINT32>(length),
            format.Get(),
            rect.width,
            rect.height,
            &layout
        ))) {
        return;
    }

    ComPtr<ID2D1SolidColorBrush> brush;
    if (FAILED(ctx->target->CreateSolidColorBrush(toD2DColor(color), &brush))) {
        return;
    }

    ctx->target->DrawTextLayout(
        D2D1::Point2F(rect.x, rect.y),
        layout.Get(),
        brush.Get()
    );
}

extern "C" void moon_d2d_end_frame(MoonD2DContext* ctx) {
    if (!ctx || !ctx->target) {
        return;
    }
    ctx->target->EndDraw();
}

#else

extern "C" MoonD2DContext* moon_d2d_create(void* hwnd, uint32_t width, uint32_t height) {
    (void)hwnd;
    (void)width;
    (void)height;
    return reinterpret_cast<MoonD2DContext*>(1);
}

extern "C" void moon_d2d_destroy(MoonD2DContext* ctx) {
    (void)ctx;
}

extern "C" bool moon_d2d_resize(MoonD2DContext* ctx, uint32_t width, uint32_t height) {
    (void)ctx;
    (void)width;
    (void)height;
    return true;
}

extern "C" void moon_d2d_begin_frame(MoonD2DContext* ctx, MoonD2DColor clear) {
    (void)ctx;
    (void)clear;
}

extern "C" void moon_d2d_fill_round_rect(
    MoonD2DContext* ctx,
    MoonD2DRect rect,
    float radius,
    MoonD2DColor color
) {
    (void)ctx;
    (void)rect;
    (void)radius;
    (void)color;
}

extern "C" void moon_d2d_draw_text(
    MoonD2DContext* ctx,
    const wchar_t* text,
    MoonD2DRect rect,
    MoonD2DTextStyle style,
    MoonD2DColor color
) {
    (void)ctx;
    (void)text;
    (void)rect;
    (void)style;
    (void)color;
}

extern "C" void moon_d2d_end_frame(MoonD2DContext* ctx) {
    (void)ctx;
}

#endif