@extends('layouts.master')

@section('content')
<!-- <section id="carouselExampleFade" class="carousel slide carousel-fade slider" data-ride="carousel">
<div class="carousel-inner">
    <div class="carousel-item active">
    <img src="assets/images/slider/4.jpg" class="d-block" alt="..." style="width:100%;">
    <div class="carousel-caption">

    
        <h2>Best Education For Diploma</h2>
        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Qui perspiciatis, eveniet sequi labore vel itaque
        adipisci odio necessitatibus voluptatibus saepe, impedit enim unde velit amet rem, suscipit corrupti vero
        ad.</p>
        <div class="button-01">
        </div>
    </div>
    </div>
    <div class="carousel-item">
    <img src="assets/images/slider/5.jpg" class="d-block" alt="..." style="width:100%;">
    <div class="carousel-caption">
        <h2>Best Education For Diploma</h2>
        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Qui perspiciatis, eveniet sequi labore vel itaque
        adipisci odio necessitatibus voluptatibus saepe, impedit enim unde velit amet rem, suscipit corrupti vero
        ad.</p>
        <div class="button-01">
        </div>
    </div>
    </div>
    <div class="carousel-item">
    <img src="assets/images/slider/3.jpg" class="d-block" alt="..." style="width:100%;">
    <div class="carousel-caption">
        <h2>Best Education For Diploma</h2>
        <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Qui perspiciatis, eveniet sequi labore vel itaque
        adipisci odio necessitatibus voluptatibus saepe, impedit enim unde velit amet rem, suscipit corrupti vero
        ad.</p>
        <div class="button-01">
        </div>
    </div>
    </div>
</div>
<a class="carousel-control-prev" href="#carouselExampleFade" role="button" data-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="sr-only">Previous</span>
</a>
<a class="carousel-control-next" href="#carouselExampleFade" role="button" data-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="sr-only">Next</span>
</a>
</section> -->

<div class="off-canvas-wrapper">
    <div class="off-canvas-wrapper-inner" data-off-canvas-wrapper="">
      <div class="off-canvas-content" data-off-canvas-content="">
        <div class="hero js-animated-hero" style="background-image:url(assets/images/slider/3.jpg)">
          <div class="container">
            <p class="hero__copy">Everyone deserves the opportunity to learn and prosper. But how?</p>
          </div>
          <svg class="hero-svg-border" x="0px" y="0px" width="794px" height="137px" viewBox="4 -85 794 137" preserveAspectRatio="xMidYMax">
            <path class="curve-base" d="M798,59.5H4v-9.667C4,49.833,206,7.5,401,7.5c212.5,0,397,41.667,397,41.667V59.5z"></path>
            <path class="curve-inverse" d="M798,59.5C798,59.5,4,59.5,4,59.5C4,59.5,3.866,-47.624,3.866,-47.624C3.866,-47.624,207.00500000000002,7.039999999999999,402.005,7.039999999999999C614.506,7.039999999999999,797.866,-47.624,797.866,-47.624C797.866,-47.624,798,59.5,798,59.5C798,59.5,798,59.5,798,59.5"></path>
            <desc>Created with Snap</desc><defs></defs>
          </svg>
        </div>
      </div> <!-- /.off-canvas-content -->
    </div> <!-- /.off-canvas-wrapper-inner -->
  </div>


  <!-- ====================== section started====================== -->

<section class="bg-01">
<div class="container">
    <div class="row">
    <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
        <div class="se-box">
        <div class="icon">
            <i class="fal fa-lightbulb-dollar"></i>
        </div>
        <div class="content">
            <h3>Get Inspired</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod</p>
        </div>
        </div>
    </div>

    <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
        <div class="se-box">
        <div class="icon">
            <i class="fal fa-box-usd"></i>
        </div>
        <div class="content">
            <h3>Give Donation</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod</p>
        </div>
        </div>
    </div>

    <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
        <div class="se-box">
        <div class="icon">
            <i class="fal fa-person-sign"></i>
        </div>
        <div class="content">
            <h3>Become a Volunteer</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod</p>
        </div>
        </div>
    </div>

    <div class="col-lg-3 col-md-3 col-sm-6 col-xs-12">
        <div class="se-box">
        <div class="icon">
            <i class="fal fa-child"></i>
        </div>
        <div class="content">
            <h3>Help The Children</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod</p>
        </div>
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
        <h2>OUR SERVICES</h2>
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
        <div class="content">
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

<section class="bg-03">
<div class="container">
    <div class="row">
    <div class="col-lg-3 col-md-4 col-sm-6 col-xs-6">
        <div class="_lk_bg_cd">
        <i class="fal fa-school"></i>
        <div class="counting" data-count="128">128</div>
        <h5>Primary Schools</h5>
        </div>
    </div>

    <div class="col-lg-3 col-md-4 col-sm-6 col-xs-6">
        <div class="_lk_bg_cd">
        <i class="fal fa-hospitals"></i>
        <div class="counting" data-count="300">300</div>
        <h5>Hospitals</h5>
        </div>
    </div>

    <div class="col-lg-3 col-md-4 col-sm-6 col-xs-6">
        <div class="_lk_bg_cd">
        <i class="fal fa-hands-helping"></i>
        <div class="counting" data-count="250">250</div>
        <h5>Volunteers</h5>
        </div>
    </div>

    <div class="col-lg-3 col-md-4 col-sm-6 col-xs-6">
        <div class="_lk_bg_cd">
        <i class="fal fa-trophy"></i>
        <div class="counting" data-count="400">400</div>
        <h5>Winning Awards</h5>
        </div>
    </div>
    </div>
</div>
</section>

<!-- ====================== Blog Section started====================== -->

<section class="bg-04">
<div class="container">
    <div class="row">
    <div class="col-12">
        <div class="heading">
        <h2>Latest News</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
            tempor incididunt</p>
        </div>
    </div>
    </div>
    <div class="row">
    <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
        <article class="_lk_bg_sd_we">
        <div class="_bv_xs_we"></div>
        <div class="_xs_we_er">
            <div class="_he_w">
            <h3>How To Donate</h3>
            <ol>
                <li><span>by</span> admin<span class="_mn_cd_xs">june 30, 2020</span></li>
            </ol>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
            </p>
            </div>
        </div>
        </article>
    </div>

    <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
        <article class="_lk_bg_sd_we">
        <div class="_bv_xs_we" style="background:url(assets/images/blog/blog_1.jpg"></div>
        <div class="_xs_we_er">
            <div class="_he_w">
            <h3>Become A Volounteer</h3>
            <ol>
                <li><span>by</span> admin<span class="_mn_cd_xs">june 30, 2020</span></li>
            </ol>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
            </p>
            </div>
        </div>
        </article>
    </div>

    <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
        <article class="_lk_bg_sd_we">
        <div class="_bv_xs_we" style="background:url(assets/images/blog/blog_3.jpg"></div>
        <div class="_xs_we_er">
            <div class="_he_w">
            <h3>Partnering to create a community</h3>
            <ol>
                <li><span>by</span> admin<span class="_mn_cd_xs">june 30, 2020</span></li>
            </ol>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.
            </p>
            </div>
        </div>
        </article>
    </div>
    </div>
</div>
</section>
@endsection
