@extends('layouts.master')

@section('content')
<section class="bg-02-a">
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="_head_01">
                    <h2>Our Work</h2>
                    <p>Home<i class="fas fa-angle-right"></i><span>Our Work</span></p>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ====================== Featured started====================== -->

<section class="bg-02">
<div class="container">
    <div class="row">
    <div class="col-12">
        <div class="heading">
        <h2>OUR WORKS</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime totam quo, ducimus aliquid quisquam
            minima perspiciatis repellendus, minus tenetur reiciendis quis? Consequatur perferendis deleniti, rerum
            delectus consectetur modi praesentium deserunt.</p>
        </div>
    </div>

    @foreach($aspects as $donate_data)
    <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
        <div class="featured-box">
        <div class="feature-card">
            <a href="{{route('cart.check', $donate_data->id)}}"><i class="far fa-link"></i></a>
            <!-- <img src="assets/images/causes/4.jpg"> -->
            <img src="{{$donate_data->image_url}}">
        </div>
        <div class="content" style="padding-bottom:20px;">
            <h3>{{$donate_data->title}}</h3>
            <p>{{$donate_data->slug}}</p>
            <a style="float:right;" href="{{route('cart.check', $donate_data->id)}}" class="btn btn-temp">Donate <i class="fas fa-dollar-sign"></i></a>
            <ol>
            <li>Year Full</li>
            <li>100 Children</li>
            <li>any time</li>
            </ol>
        </div>
        
        </div>
    </div>
    @endforeach

    </div>
</div>
</section>

@endsection