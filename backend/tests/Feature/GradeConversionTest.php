<?php

namespace Tests\Feature;

// File: backend/tests/Feature/GradeConversionTest.php

use App\Services\GradeService;
use Tests\TestCase;

class GradeConversionTest extends TestCase
{
    public function test_grade_conversion_scale_is_applied(): void
    {
        $service = new GradeService();

        $this->assertSame(4.0, $service->mapGradePoint(97));
        $this->assertSame(3.75, $service->mapGradePoint(95));
        $this->assertSame(3.5, $service->mapGradePoint(92));
        $this->assertSame(3.25, $service->mapGradePoint(90));
        $this->assertSame(3.0, $service->mapGradePoint(88));
        $this->assertSame(2.75, $service->mapGradePoint(86));
        $this->assertSame(2.5, $service->mapGradePoint(83));
        $this->assertSame(2.25, $service->mapGradePoint(81));
        $this->assertSame(2.0, $service->mapGradePoint(79));
        $this->assertSame(1.75, $service->mapGradePoint(77));
        $this->assertSame(1.5, $service->mapGradePoint(74));
        $this->assertSame(1.25, $service->mapGradePoint(71));
        $this->assertSame(1.0, $service->mapGradePoint(70));
        $this->assertSame(0.0, $service->mapGradePoint(69.99));
    }
}
