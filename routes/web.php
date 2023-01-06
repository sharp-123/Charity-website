<?php
// use Illuminate\Support\Facades\Route;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

/*Route::get('/', function () {
    return view('welcome');
});*/
Route::get('language/{locale}', function ($locale) {
    app()->setLocale($locale);
    session()->put('locale', $locale);
    return redirect()->back();
});
Route::get('aspect/language/{locale}', function ($locale) {
    app()->setLocale($locale);
    session()->put('locale', $locale);
    return redirect()->back();
});
Route::get('category/language/{locale}', function ($locale) {
    app()->setLocale($locale);
    session()->put('locale', $locale);
    return redirect()->back();
});
Route::get('author/language/{locale}', function ($locale) {
    app()->setLocale($locale);
    session()->put('locale', $locale);
    return redirect()->back();
});
Route::get('cart/language/{locale}', function ($locale) {
    app()->setLocale($locale);
    session()->put('locale', $locale);
    return redirect()->back();
});

Route::get('/', 'AspectHomeController@index')->name('aspect.home');
Route::get('/foundation', 'AspectHomeController@foundation')->name('aspect.foundation');
Route::get('/aboutus', 'AspectHomeController@aboutus')->name('aspect.aboutus');
Route::get('/services', 'AspectHomeController@services')->name('aspect.services');
Route::get('/blog', 'AspectHomeController@blog')->name('aspect.blog');
Route::get('/contactus', 'AspectHomeController@contactus')->name('aspect.contactus');

// Route::get('/donate', 'CheckoutController@index')->name('donate');
Route::get('get-video/{id}', 'AspectHomeController@getVideo')->name('getVideo');


Route::get('/all-aspects', 'AspectHomeController@allAspects')->name('all-aspects');

Route::post('/aspect/{aspect}/donation', 'DonationsController@store')->name('aspect.donation');


Route::get('/cart/checkout/{id}', 'CheckoutController@check_index')->name('cart.check');
Route::post('/cart/{id}/proceed', 'CheckoutController@store')->name('cart.proceed');
// Route::get('/cart/payment/{cost}', 'CheckoutController@show')->name('cart.payment');
Route::post('/cart/checkout', 'CheckoutController@pay')->name('cart.checkout');
// End of cart route

Auth::routes();

Route::get('/home', 'HomeController@index')->name('home');

// Admin Route group
Route::group(['middleware' => 'admin'], function (){
    Route::get('/admin-home', 'Admin\AdminBaseController@index')->name('admin.home');

    Route::put('/admin/aspects/restore/{id}', 'Admin\AdminAspectsController@restore')
        ->name('aspect.restore');
    Route::delete('admin/aspects/forceDelete/{id}', 'Admin\AdminAspectsController@forceDelete')
        ->name('aspect.forceDelete');
    Route::get('/trash-aspects', 'Admin\AdminAspectsController@trashAspects')
        ->name('admin.trash-aspects');

    Route::resource('/admin/aspects', 'Admin\AdminAspectsController');
    Route::resource('/admin/users', 'Admin\AdminUsersController');
    Route::resource('/admin/donations', 'Admin\AdminDonationsController');
});
// End of admin route

// Users route group
Route::group(['middleware' => 'user'], function (){
    Route::get('/user-home', 'Users\UsersBaseController@index')->name('user.home');

    Route::get('/my-donations', 'Users\UserDonationsController@myDonations')->name('user.donations');
    Route::delete('/donation-delete/{id}', 'Users\UserDonationsController@deleteDonation')->name('donation.delete');
});
// End of users route

Route::get('/logout', 'CustomLogoutController@logout')->name('logout');

// Paypal route
Route::get('payment/{cost}', 'PayPalController@payment')->name('payment');
Route::get('cancel', 'PayPalController@cancel')->name('payment.cancel');
Route::get('payment/success', 'PayPalController@success')->name('payment.success');


//Contact Route
Route::post('/email/send', 'EmailController@sendEmail')->name('email.send');