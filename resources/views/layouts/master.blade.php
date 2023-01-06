<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>{{ __('Charity') }} - {{ __('Home') }}</title>
  <!-- Favicon icon -->
  <link rel="icon" href="{{asset('/')}}assets/img/favicon-2.png" type="image/x-icon">
  
  <!-- Template Assets -->
  <link rel="stylesheet" href="{{asset('/')}}assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="{{asset('/')}}assets/css/all.min.css">
  <link rel="stylesheet" href="{{asset('/')}}assets/css/style.css">
  <link rel="stylesheet" href="{{asset('/')}}assets/galaxy_carousel/style.css">
</head>
<body class="home page-template-default page page-id-692">
  @include('layouts.includes.navbar')
  @yield('content')
  <footer style="background-color:#004c6c;">
    <div class="container">
      <div class="row">
        <div class="col-lg-3 col-md-3 col-sm-6 col-12">
          <div class="_kl_de_w">
            <h3>SMART GROUP</h3>
            <p>ipsum dolor sit amet, Excepteur sint occaecat cupidatat non
              proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
          </div>
        </div>

        <div class="col-lg-3 col-md-3 col-sm-6 col-12">
          <div class="_kl_de_w">
            <h3>Quick Links</h3>
            <ol>
              <li><i class="far fa-angle-right"></i>home</li>
              <li><i class="far fa-angle-right"></i>About Us</li>
              <li><i class="far fa-angle-right"></i>Services</li>
              <li><i class="far fa-angle-right"></i>Blog</li>
              <!-- <li class="last"><i class="far fa-angle-right"></i>Contact Us</li> -->
            </ol>
          </div>
        </div>

        <div class="col-lg-3 col-md-3 col-sm-6 col-12">
          <div class="_kl_de_w">
            <h3>Services</h3>
            <ol>
              <li><i class="far fa-angle-right"></i>Raise fund for healthy food</li>
              <li><i class="far fa-angle-right"></i>Education for poor children</li>
              <li><i class="far fa-angle-right"></i>Promoting the rights of children</li>
              <li><i class="far fa-angle-right"></i>Massive donation to poor</li>
              <li class="last"><i class="far fa-angle-right"></i>Huge help to homeless pupil</li>
            </ol>
          </div>
        </div>

        <div class="col-lg-3 col-md-3 col-sm-6 col-12">
          <div class="_kl_de_w">
            <h3>Contact Us</h3>
            <form class="my-form" action="{{route('email.send')}}" method="post">
              <div class="form-group">
                <input class="form-control" id="email" type="email" name="email" placeholder="Email" required>
              </div>
              <div class="form-group">
                <textarea id="message" rows="3" placeholder="Message" class="form-control" required></textarea>
              </div>
              <div class="form-group">
                <button type="submit" class="btn btn-danger">Send Message</button>
              </div>
            </form>
          </div>
        </div>

        <div class="col-12">
          <div class="copy-right">
            <p>© 2022 David Riley Stevens</a></p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</body>

<script src="assets/js/jquery-3.2.1.min.js"></script>
<script src="assets/js/popper.min.js"></script>
<script src="assets/js/bootstrap.min.js"></script>
<script src="assets/js/script.js"></script>

<script type="text/javascript" src="assets/galaxy_carousel/jquery.js" id="jquery-js"></script>
<script type="text/javascript" src="assets/galaxy_carousel/jquery.qtip.js" id="qtip-js"></script>
<script type="text/javascript" src="assets/galaxy_carousel/source.dev.js" id="site-js-js"></script>

</html>

